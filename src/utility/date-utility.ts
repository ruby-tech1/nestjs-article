export class DateUtility {
  static get currentDate() {
    return new Date(Date.now());
  }

  static addMinutes(value: number): Date {
    const currentDate = this.currentDate;
    currentDate.setMinutes(currentDate.getMinutes() + value);

    return currentDate;
  }

  static addDay(value: number): Date {
    const currentDate = this.currentDate;
    currentDate.setDate(currentDate.getDate() + value);

    return currentDate;
  }

  static get validDob(): Date {
    const currentDate: Date = this.currentDate;
    currentDate.setFullYear(currentDate.getFullYear() - 10);
    return currentDate;
  }
}
