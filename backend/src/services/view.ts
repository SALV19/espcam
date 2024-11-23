export const getCam = (req: any, res: any) => {
  res.render("index", { title: "ESP-CAM" });
};
export const getPhoto = (req: any, res: any) => {
  res.render("get_photo", { title: "Get Photo" });
};
