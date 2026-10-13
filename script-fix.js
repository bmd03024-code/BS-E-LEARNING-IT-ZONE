// নতুন ফাইল: fix-features.js (গিটহাবে নতুন ফাইল হিসেবে যোগ করতে পারেন)

document.addEventListener("DOMContentLoaded", function() {
    // ১. পাসওয়ার্ড এবং জিমেইল ফিল্ড সিকিউর/মাস্ক করার জন্য (অদৃশ্যমান বা ডট দেখানোর জন্য)
    const passwordFields = document.querySelectorAll('input[type="text"], input[type="password"]');
    passwordFields.forEach(input => {
        // যদি ইনপুটের আইডি বা ক্লাস পাসওয়ার্ড বা পিন সম্পর্কিত হয়
        if (input.id.toLowerCase().includes('pass') || input.name.toLowerCase().includes('pass')) {
            input.type = 'password'; // এটি অক্ষরগুলো ডট বা স্টার (*) করে দেবে
        }
    });

    // ২. এডমিন প্যানেলের 'সংরক্ষণ করুন' (Save) বাটন সচল করার জন্য
    // আপনার বাটনের আইডি যদি 'saveBtn' বা ক্লাস 'save-btn' হয়, সে অনুযায়ী এটি কাজ করবে
    const saveButton = document.getElementById('saveBtn') || document.querySelector('.save-btn');
    
    if (saveButton) {
        saveButton.addEventListener('click', function(event) {
            event.preventDefault();
            
            // ফর্মে ইনপুট করা ডেটাগুলো সংগ্রহ করা
            const inputs = document.querySelectorAll('input, textarea, select');
            let formData = {};
            
            inputs.forEach(input => {
                if (input.id || input.name) {
                    formData[input.id || input.name] = input.value;
                }
            });

            // ব্রাউজারের LocalStorage-এ নিরাপদে ডেটা সেভ করা
            try {
                localStorage.setItem('adminSavedData', JSON.stringify(formData));
                alert("সফলভাবে সংরক্ষণ করা হয়েছে!");
            } catch (error) {
                console.error("সংরক্ষণ করতে সমস্যা হয়েছে:", error);
                alert("সংরক্ষণ করতে ব্যর্থ হয়েছে!");
            }
        });
    }
});