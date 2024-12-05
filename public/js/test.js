// public/js/test.js
document.getElementById('testButton').addEventListener('click', testWebhook);

async function testWebhook() {
    try {
        const response = await fetch('/api/subscription/test-webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        document.getElementById('result').textContent = 
            JSON.stringify(data, null, 2);
    } catch (error) {
        document.getElementById('result').textContent = 
            'Error: ' + error.message;
    }
}