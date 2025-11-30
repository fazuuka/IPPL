import QRCode from "qrcode";

export const generateQRCode = async (data, filename) => {
  const path = `qr/${filename}.png`;
  await QRCode.toFile(path, data);
  return path;
};
