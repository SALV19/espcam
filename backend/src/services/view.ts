export const getCam = (req: any, res: any) => {
  res.render("index", { title: "ESP-CAM" });
};
export const getPhoto = (req: any, res: any) => {
  res.render("get_photo", { title: "Get Photo" });
};
export const borrego = (req: any, res: any) => {
  res.render("borrego_cosmico", { title: "Get Photo" });
};
export const welcome = (req: any, res: any) => {
  res.render("welcome_center", { title: "Get Photo" });
};
