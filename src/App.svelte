<script lang="ts">
import { LoadingStatus, ValidType, type Word } from './lib/types'
import { updateDictionary, loadDictionary } from './lib/http'
import { dictionary, token, saveToken, getToken, editMode, getEditMode } from './lib/stores'
import { checkValidity, getFormInputValueFactory } from './lib/utils'

let searchTerm = ''
let sortBy = 'word'
let currentPage = 1
const itemsPerPage = 10

let filteredWords: Word[] = []
let sortedWords: Word[] = []
let paginatedWords: Word[] = []
let totalPages = 1
let loadingStatus: LoadingStatus = LoadingStatus.Loading

loadDictionary(getToken())
  .then((data) => {
    loadingStatus = LoadingStatus.Loaded
    dictionary.set(data)
  })
  .catch((err) => {
    loadingStatus = LoadingStatus.Error
    console.error('Load dictionary failed:', err)
  })

function onSaveToken(event: Event) {
  const tokenVal = (event.target as HTMLInputElement).value
  saveToken(tokenVal)
}

function addWordSimple(form: HTMLFormElement) {}

function addWord(event: Event, tokenVal: string) {
  event.preventDefault()

  const form = event.target as HTMLFormElement
  let dict: Word[] = []
  dictionary.subscribe((v) => {
    dict = v
  })()

  function checker(word: Word) {
    const validType = checkValidity(word)
    if (validType !== ValidType.Valid) {
      return `Inwalidu: ${validType}`
    }

    if (dict.some((item) => item.word === word.word)) {
      return `Zo wode "${word.word}" ekesitm`
    }

    newWord.push(word)
    return
  }

  const getter = getFormInputValueFactory(form)
  const newWord: Word[] = []

  if (getter('editMode') === 'complex') {
    const list = getter('list')
      .trim()
      .split('\n')
      .map((line) => line.trim().split('|'))

    for (const [index, arr] of list.entries()) {
      if (arr.length < 3 || arr.length > 4) {
        alert(`Inwalidu ai ${index + 1}`)
        return
      }

      const result = checker({
        id: dict.reduce((maxId, word) => Math.max(maxId, word.id), 0) + index + 1,
        word: arr[0],
        type: arr[1] as Word['type'],
        meaning: arr[2],
        example: arr[3] || ''
      })

      if (result) {
        alert(`${result} ai ${index + 1}`)
        return
      }
    }
  } else {
    const result = checker({
      id: dict.reduce((maxId, word) => Math.max(maxId, word.id), 0) + 1,
      word: getter('word'),
      type: getter('type') as Word['type'],
      meaning: getter('meaning'),
      example: getter('example')
    })

    if (result) {
      alert(result)
      return
    }
  }

  if (newWord.length === 0) {
    return
  }

  const data = [...dict, ...newWord]
  updateDictionary(
    tokenVal,
    data,
    `Wode: ${newWord.length === 0 ? `adu z "${newWord[0].word}" (${newWord[0].type})"` : `totu z ${newWord.length} wode`}`
  )
    .then(() => {
      dictionary.set(data)
      form.reset()
    })
    .catch((err) => {
      alert(`Foun apudetu：${err.message}`)
      console.error('Update dictionary failed:', err)
    })
}

function deleteWord(word: Word, tokenVal: string) {
  if (!confirm(`Sueu diletu "${word.word}" (${word.type})?`)) return
  let data: Word[] = []
  dictionary.subscribe((v) => {
    data = v.filter((w) => w.id !== word.id)
  })()
  updateDictionary(tokenVal, data, `Wode: diletu z "${word.word}" (${word.type})"`)
    .then(() => {
      dictionary.set(data)
    })
    .catch((err) => {
      alert(`Foun apudetu：${err.message}`)
      console.error('Update dictionary failed:', err)
    })
}

$: dictionary.subscribe((dict) => {
  filteredWords = dict.filter(
    (word) =>
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  )
  sortedWords = [...filteredWords].sort((a, b) => {
    if (sortBy === 'word') return a.word.localeCompare(b.word)
    if (sortBy === 'type') return a.type.localeCompare(b.type)
    return 0
  })
  totalPages = Math.ceil(sortedWords.length / itemsPerPage)
  if (currentPage > totalPages) currentPage = totalPages || 1
  paginatedWords = sortedWords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
})
</script>

<div class="max-w-5xl mx-auto p-14">
  <div class="text-3xl font-bold mb-6">
    <span class="text-teal-400">L</span>a<span class="text-teal-300">m</span
    >u<span class="text-teal-300">t</span>o Dikoshinore
  </div>
  <div class="mb-6 mx-auto"><a class="text-teal-400 hover:text-teal-500 font-bold" href="/book.html">👉 To learn Lamuto Language 👈</a></div>
  <div class="flex flex-col sm:flex-row gap-4 mb-6">
    <input
      bind:value={searchTerm}
      placeholder="Sechiu wodez o miniez..."
      class="flex-grow border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-teal-300"
    />
    <select
      bind:value={sortBy}
      class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-teal-300"
    >
      <option value="word">Bai jimue</option>
      <option value="type">Bai tepue</option>
    </select>
  </div>

  {#if loadingStatus === LoadingStatus.Loading}
    <div class="text-center text-gray-600">Li Lodeu...</div>
  {:else if loadingStatus === LoadingStatus.Error}
    <div class="text-center text-red-600">Foun bi lodeu, Chiku netewoke.</div>
  {:else if filteredWords.length === 0}
    <div class="text-center text-gray-600">Mit zo</div>
  {:else}
    <div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each paginatedWords as word}
          <div
            class="p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            {#if $token}
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-2xl font-semibold">{word.word}</h3>
                <button
                  type="button"
                  class="relative top-0 right-0 mr-2 border-0 items-end bg-gray-100 text-gray-400 hover:text-red-500 rounded-full"
                  on:click={() => deleteWord(word, $token)}
                  >X
                </button>
              </div>
            {:else}
              <h3 class="text-2xl font-semibold mb-1">{word.word}</h3>
            {/if}
            <p class="text-sm text-gray-500 mb-2">{word.type}</p>
            <p class="mb-2">{word.meaning}</p>
            <p class="text-sm italic text-gray-400">{word.example}</p>
          </div>
        {/each}
      </div>
      <div class="flex items-center justify-center gap-4 mt-6">
        <button
          on:click={() => (currentPage = Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          class="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition"
        >
          Laste
        </button>
        <span class="text-gray-600"
          >Zo z {currentPage} pegie/ Totu z {totalPages} pegie</span
        >
        <button
          on:click={() => (currentPage = Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          class="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 transition"
        >
          Nekte
        </button>
      </div>
    </div>
  {/if}

  <div class="mt-16 border rounded-lg shadow">
    <div class="gap-4 grid">
      <input
        type="text"
        placeholder="Iputu z GitHub Tokene"
        value={$token}
        on:input={onSaveToken}
        class="border border-gray-300 text-white p-3 rounded focus:outline-none focus:ring focus:border-teal-300 focus:text-black"
      />
    </div>
    {#if $token}
      <h3 class="text-xl font-semibold mb-4">Adu yum wodez</h3>
      <form
        on:submit|preventDefault={(e) => addWord(e, $token)}
        class="gap-4 grid"
      >
        <select name="editMode" value={$editMode ? 'complex' : 'simple'} class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-teal-300" on:input={(e) => (editMode.set((e.target as HTMLSelectElement).value === 'complex'))}>
          <option value="simple">Sinpum</option>
          <option value="complex">Koplekem</option>
        </select>
        {#if $editMode}
          <textarea
            name="list"
            placeholder="*((Wode)|(Tepue)|(Minie)[|(Ekzebue)]\n)"
            required
            class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-teal-300"
            rows="10"
          ></textarea>
        {:else}
        <input
        name="word"
        placeholder="Wode"
        required
        class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-teal-300"
      />
      <select
        name="type"
        required
        class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-teal-300"
      >
        <option value="n.">N</option>
        <option value="v.">V</option>
        <option value="adj.">ADJ</option>
        <option value="adv.">ADV</option>
        <option value="pron.">PRON</option>
        <option value="conj.">CONJ</option>
        <option value="intj.">INTJ</option>
        <option value="prep.">PREP</option>
      </select>
      <input
        name="meaning"
        placeholder="Minie"
        required
        class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-teal-300"
      />
      <input
        name="example"
        placeholder="Ekzebue"
        class="border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:border-teal-300"
      />
      {/if}
        <button
          type="submit"
          class="bg-teal-300 border border-gray-300 text-white p-3 rounded hover:bg-teal-400 transition"
        >
          Adu
        </button>
      </form>
    {/if}
  </div>

  <div class="mt-13 mb-0 text-center text-gray-500">
    <hr class="w-full border-gray-300 mb-6" />
    Koprete © 2025 bai <a
      class="text-teal-400 no-underline hover:underline"
      href="https://github.com/biyuehu/lamuto"
    >
      Lamuto</a
    >
  </div>
</div>

<style>
  :global(body) {
    font-family: "Inter", sans-serif;
  }
</style>
