export default function (status: number) {
  switch (status) {
    case -1:
      return 'declined';
    case 0:
      return 'pending';
    case 1:
      return 'added';
    default:
      return '';
  }
}
