async function convert() {
const amountRaw = document.getElementById("amount").value;
const from = document.getElementById("from").value;
const to = document.getElementById("to").value;
const result = document.getElementById("result");
const amount = parseFloat(amountRaw);
if (isNaN(amount) || amount <= 0) {
    result.innerText = "enter more than 0";
    return;
}

try {

    if (from === to) {
    result.innerText = `${amount} ${from} = ${amount.toFixed(2)} ${to}`;
    return;
    }

    const res = await fetch(`https://api.frankfurter.dev/v2/rates?base=${from}&quotes=${to}`);
    const data = await res.json();

    const rate = data && data[0].rate ? data[0].rate : undefined;

    if (rate === undefined) {
    result.innerText = `not available for ${to}`;
    console.error('rate not found', data);
    return;
    }

    const converted = (amount * rate).toFixed(2);
    result.innerText = `${amount} ${from} = ${converted} ${to}`;
} catch (error) {
    result.innerText = "Error fetching data";
    console.error(error);
}
}

async function getCountryName() {
    let to =  document.getElementById("to")
    let from =  document.getElementById("from")
    try {
        const res = await fetch('https://api.frankfurter.dev/v2/currencies')
        const currencies = await res.json()

        if(currencies) {
            currencies.forEach(code => {
                const optionTo = document.createElement("option")
                optionTo.value = code.iso_code;
                optionTo.textContent = code.iso_code;
                from.appendChild(optionTo);

                const optionFrom = document.createElement("option")
                optionFrom.value = code.iso_code;
                optionFrom.textContent = code.iso_code;
                to.appendChild(optionFrom);
            });
        }

    } catch (error) {
        console.log(error)
    }
}

getCountryName()