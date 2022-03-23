import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import Editor from './editor.js';

const RESOURCES_PATH = 'resources';
const SCHEMA_FILE = 'schema.json';
const DATA_FILE = 'flavors.json';

const editorHolder = document.createElement('div');
document.body.appendChild(editorHolder);

const editor = new Editor(
  `${RESOURCES_PATH}/${SCHEMA_FILE}`,
  `${RESOURCES_PATH}/${DATA_FILE}`
);

editor.init(editorHolder);
