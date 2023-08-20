import swal from "./swal";

/**@param {import("sweetalert2").SweetAlertOptions} options */
export default function msg(options) {
    return swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 4000,
        icon: "success",
        timerProgressBar:true,
        ...options
    });
}