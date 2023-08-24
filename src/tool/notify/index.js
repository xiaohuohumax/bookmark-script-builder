import { Notify } from "notiflix/build/notiflix-notify-aio";
import "notiflix/dist/notiflix-3.2.6.min.css";
import "./index.css";

Notify.init({
    ID: "notiflix_notify_" + new Date().getTime()
});

export default Notify;