
document.getElementById('registerForm').addEventListener('submit', (e) => {
    if (document.getElementById('pass1').value !== document.getElementById('pass2').value) {
        e.preventDefault()
        document.getElementById('err').innerHTML = "passwords don't match"
    } 
})

localStorage.clear()