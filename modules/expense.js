class Expense {
  id;
  name;
  amount;
  frequency;
  total;

  constructor(id, name, amount, frequency) {
    this.id = id;
    this.name = name;
    this.amount = amount;
    this.frequency = frequency;
    this.total = this.amount * this.frequency;
  }

  amountPerMonth() {
    return this.amount * this.frequency;
  }
}

export { Expense };
