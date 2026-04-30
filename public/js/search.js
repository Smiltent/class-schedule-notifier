
/**
 * This function extends onto the lookup.js system...
 * It uses the existing element, to make it searchable
 */
export function setup(element, placeholder = "Search...") {
    if (!element) return

    if (element.dataset.searchable === "true") return
    element.dataset.searchable = "true" // prevent double init

    element.style.searchable = "none"

    const wrapper = document.createElement("div")
    wrapper.className = "customSelect"

    const input = document.createElement("input")
    input.type = "text"
    input.placeholder = placeholder
    input.autocomplete = "off"

    const optionsDiv = document.createElement("div")
    optionsDiv.className = "customOptions"

    wrapper.appendChild(input)
    wrapper.appendChild(optionsDiv)

    element.parentNode.insertBefore(wrapper, element.nextSibling)

    function buildOptions() {
        optionsDiv.innerHTML = ""

        Array.from(element.options).forEach(option => {
            if (!option.value) return

            const div = document.createElement("div")
            div.textContent = option.textContent

            div.addEventListener("click", () => {
                element.value = option.value
                input.value = option.textContent
                element.dispatchEvent(new Event("change"))
                optionsDiv.style.display = "none"
            })

            optionsDiv.appendChild(div)
        })
    }

    buildOptions()

    const observer = new MutationObserver(buildOptions)
    observer.observe(element, { childList: true })

    input.addEventListener("click", () => {
        optionsDiv.style.display = optionsDiv.style.display === "block" ? "none" : "block"
    })

    input.addEventListener("input", () => {
        const filter = input.value.toLowerCase()
        Array.from(optionsDiv.children).forEach(div => {
            div.style.display = div.textContent.toLowerCase().includes(filter) ? "block" : "none"
        })
    })

    document.addEventListener("click", (e) => {
        if (!wrapper.contains(e.target)) {
            optionsDiv.style.display = "none"
        }
    })

    element.addEventListener("change", () => {
        const selected = element.options[element.selectedIndex]
        if (selected) input.value = selected.textContent
    })

    if (element.value) {
        const selected = element.options[element.selectedIndex]
        if (selected) input.value = selected.textContent
    }
}