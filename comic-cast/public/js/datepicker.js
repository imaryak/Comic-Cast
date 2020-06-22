const today = new Date();
const days = today.getDate();
const months = today.getMonth() + 1;
const year = today.getFullYear() - 16;

function zero (n) {
    return (n < 10) ? ("0" + n) : n;
}

const day = zero(days);
const month = zero(months)
const newDate = year+'-'+month+'-'+day;

document.getElementById("datefield").setAttribute('max', newDate);
