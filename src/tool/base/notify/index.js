import { Notify as notify } from "notiflix/build/notiflix-notify-aio";
import "notiflix/dist/notiflix-3.2.6.min.css";
import "./index.css";

notify.init({
    ID: "notiflix_notify_" + new Date().getTime()
});

export { notify };