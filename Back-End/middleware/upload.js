import multer from "multer";

const storage = multer.memoryStorage(); // simpan di memory bukan disk
const upload = multer({ storage });

export default upload;
