export default function makeForm(data) {
  const form = new FormData();

  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      form.append(key, data[key]);
    }
  }

  return form;
}
