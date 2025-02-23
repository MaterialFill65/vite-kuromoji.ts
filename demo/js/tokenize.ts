import kuromoji from "../../build/kuromoji";
const DIC_URL = "../dict/unidic";
(async ()=>{
    const input = document.querySelector("#input") as HTMLInputElement

    input?.addEventListener("change", () => {
        console.log("Tokenizing:", input.value)
        tokenize(input.value)
    });

    async function initializeTokenizer() {
        const msgbox = document.querySelector("#load-msgbox") as HTMLDivElement;
        const frombox = document.querySelector("#formbox") as HTMLDivElement;

        msgbox.style.display = "block";
        frombox.style.display = "none";
        // Load and prepare tokenizer
        const tokenizer = await kuromoji.build({ dicPath: DIC_URL, dicType: "UniDic" });

        input.value = "すもももももももものうち";
        msgbox.style.display = "none";
        frombox.style.display = "block";
        return tokenizer;
    }

    const tokenizer = await initializeTokenizer();
    async function tokenize(inputText: string) {
        const tokens = tokenizer.tokenize(inputText);
        const tokensElement = document.querySelector("#tokens") as HTMLDivElement;
        tokensElement.innerHTML = "";
        tokens.forEach((token => {
            const tokenElement = document.createElement("tr")
            const surface_formElement = document.createElement("td")
            surface_formElement.textContent = token.surface_form
            const posElement = document.createElement("td")
            posElement.textContent = token.pos
            const pos_detail_1Element = document.createElement("td")
            pos_detail_1Element.textContent = token.pos_detail_1
            const pos_detail_2Element = document.createElement("td")
            pos_detail_2Element.textContent = token.pos_detail_2
            const pos_detail_3Element = document.createElement("td")
            pos_detail_3Element.textContent = token.pos_detail_3
            const conjugated_typeElement = document.createElement("td")
            conjugated_typeElement.textContent = token.conjugated_type
            const conjugated_formElement = document.createElement("td")
            conjugated_formElement.textContent = token.conjugated_form
            const basic_formElement = document.createElement("td")
            basic_formElement.textContent = token.basic_form
            const readingElement = document.createElement("td")
            readingElement.textContent = token.reading ?? null
            const pronunciationElement = document.createElement("td")
            pronunciationElement.textContent = token.pronunciation ?? null
            tokenElement.appendChild(surface_formElement)
            tokenElement.appendChild(posElement)
            tokenElement.appendChild(pos_detail_1Element)
            tokenElement.appendChild(pos_detail_2Element)
            tokenElement.appendChild(pos_detail_3Element)
            tokenElement.appendChild(conjugated_typeElement)
            tokenElement.appendChild(conjugated_formElement)
            tokenElement.appendChild(basic_formElement)
            tokenElement.appendChild(readingElement)
            tokenElement.appendChild(pronunciationElement)
            tokensElement.appendChild(tokenElement)
        }))
    }
})()
