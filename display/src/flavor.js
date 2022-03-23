class Additive {
  constructor(type) {
    this._element = document.createElement('sup');
    this._element.classList.add('additive');
    this._element.textContent = type;
  }
  /**
   *
   * @param {HTMLElement} parent
   *
   * @returns {Additive}
   */

  init(parent) {
    parent.appendChild(this._element);

    return this;
  }
  /**
   *
   * @param {HTMLElement} parent
   */

  destroy(parent) {
    parent.removeChild(this._element);
  }
}

class Flavor {
  /**
   *
   * @param {Object} flavor
   */
  constructor(flavor) {
    this._flavor = flavor;
    this._element = document.createElement('div');
    this._element.classList.add(this._flavor.type);
    this._element.classList.add('flavor');
    this._additives = Object.entries(flavor.additives)
      .filter(([, create]) => create)
      .map(([key]) => new Additive(key));
    this._name = document.createElement('span');
    this._name.textContent = this._flavor.flavor;
  }

  get name() {
    return this._name;
  }

  /**
   *
   * @param {HTMLElement} parent
   */
  init(parent) {
    this._initContent(this._flavor);
    parent.appendChild(this._element);
    return this;
  }

  _initContent(flavor) {
    this._element.classList.replace(this._flavor.type, flavor.type);
    this._element.appendChild(this.name);
    this._additives.forEach((additive) => additive.init(this._element));
  }
  /**
   *
   * @param {HTMLElement} parent
   */

  destroy(parent) {
    this._additives = this._additives.map((additive) => {
      additive.destroy(this._element);
      return null;
    });
    parent.removeChild(this._element);
  }
}

export default Flavor;
