import { JSONEditor } from '@json-editor/json-editor';

class Editor {
  constructor(schemaEndpoint = '', dataEndpoint = '') {
    this._schemaEndpoint = schemaEndpoint;
    this._dataEndpoint = dataEndpoint;
    this._editor = null;
    this._schema = null;
    this._data = null;
  }

  _fetch() {
    return Promise.all(
      [this._schemaEndpoint, this._dataEndpoint].map((endpoint) =>
        fetch(endpoint)
      )
    )
      .then((responses) =>
        ['schema', 'data'].map((fileType, index) => {
          const response = responses[index];
          if (!response || !response.ok) {
            throw new Error(
              `Unable to load ${fileType}: ${response.status} ${response.statusText}`
            );
          }
          return response;
        })
      )
      .then((responses) =>
        Promise.all(responses.map((response) => response.json()))
      )
      .then((parsedResponses) => {
        const [schema, data] = parsedResponses;
        this._schema = schema;
        this._data = data;
      });
  }

  _save() {
    fetch(this._dataEndpoint, {
      method: 'PUT',
      body: JSON.stringify(this._editor.getValue()),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to save data');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  init(parent) {
    this._fetch()
      .then(() => {
        this._editor = new JSONEditor(parent, {
          schema: this._schema,
          startval: this._data,
          theme: 'bootstrap4',
          ajax: true,
          disable_array_delete_all_rows: true,
          disable_collapse: true,
          disable_edit_json: true,
          disable_properties: true
        });

        this._editor.on('change', () => {
          if (!this._editor.validate().length) {
            this._save();
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

export default Editor;
