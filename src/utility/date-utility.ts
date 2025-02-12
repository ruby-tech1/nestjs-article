export class DateUtility {
  static get currentDate() {
    return new Date(Date.now());
  }

  public static get validDob(): Date {
    const currentDate: Date = this.currentDate;
    currentDate.setFullYear(currentDate.getFullYear() - 10);
    return currentDate;
  }
}
