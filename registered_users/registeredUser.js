export class registereduser {
  constructor(name, phone) {
    this.name = name;
    this.phone = phone;
    this.id = new Date().toString() + Math.random().toString();
  }
}
