export function replaceInArray<T>(arr: T[], _id: string, patchObject: object) {
  const arrCopy: any[] = [...arr];
  const index = arrCopy.findIndex((x) => x._id === _id);
  arrCopy[index] = { ...arrCopy[index], ...patchObject };
  return arrCopy;
}

export const toggleStatus = (status: number) => (status === 0 ? -1 : 0);

export const noOpFn = () => undefined;
