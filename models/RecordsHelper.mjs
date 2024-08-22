import hbs from "hbs";

export function registerRecordsHelper(){
  hbs.registerHelper("createStringRecords", (obj) => {
    if (Object.keys(obj).length === 0) {
      return new Handlebars.SafeString("<p>Нет рекордов</p>");
    }
    let result = "";
    Object.keys(obj).forEach((key) => {
      result += `<li>${hbs.Utils.escapeExpression(
        key
      )}:${hbs.Utils.escapeExpression(obj[key])}</li>`;
    });
    return new hbs.SafeString(`<ul class = "records__list">${result}</ul>`);
  });
  
}
