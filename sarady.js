datasets = {
	// name, description, file
	"jednoduche": {
		name: "Jednoduché", desc: "Obtížnost: lehká",
		filename: "datasets/jednoduche.csv",
	},
	"stredni": {
		name: "Střední", desc: "Obtížnost: střední, občas abstraktní",
		filename: "datasets/stredni.csv",
	},
	"dlouhe": {
		name: "Dlouhé", desc: "Obtížnost: lehká, ale hodně slov",
		filename: "datasets/dlouhe.csv",
	},
	"informaticke": {
		name: "Informatické", desc: "Obtížnost: lehká až střední, informatické pojmy",
		filename: "datasets/informaticke.csv"
	},
};

var current_word = localStorage.getItem("current_word");

var activated_datasets = JSON.parse(localStorage.getItem("activated_datasets"));
if (activated_datasets === null) {
	activated_datasets = Object.keys(datasets);
}
var dataset_words = {};

var used_words = JSON.parse(localStorage.getItem("used_words"));
if (used_words === null) {
	used_words = [];
}

var words = [];
var remaining_words = [];

function init() {
	var div = document.getElementById("datasets");
	Object.entries(datasets).forEach((el) => {
		var name = el[0];
		var id = `ch-${name}`;
		var ch = document.createElement("input");
		ch.type = "checkbox";
		ch.id = id;
		ch.checked = activated_datasets.includes(name);
		ch.onchange = updateDatasets;
		var label = document.createElement("label");
		label.htmlFor = id
		label.innerHTML = `${el[1].name}<small>(${dataset_words[name].length})</small>`;
		div.appendChild(ch);
		div.appendChild(label);
	});
	updateDatasets();

	if (current_word && remaining_words.includes(current_word)) {
		document.getElementById('word').innerText = current_word;
	} else {
		current_word = null;
	}
}

function updateDatasets() {
	words = [];
	activated_datasets = [];
	Object.entries(datasets).forEach((el) => {
		var name = el[0];
		var ch = document.getElementById(`ch-${name}`);
		if (ch.checked) {
			activated_datasets.push(name);
			words.push(...dataset_words[name]);
		}
	});
	localStorage.setItem("activated_datasets", JSON.stringify(activated_datasets));
	remaining_words = words.filter(x => !used_words.includes(x));
	updateStatistics();
}

function updateStatistics() {
	var total = words.length;
	var used = used_words.length;
	document.getElementById('statistics').innerHTML =
		`${words.length} slov celkem, ${used_words.length} použito, ${remaining_words.length} zbývá`;
}

function nextWord() {
	if (current_word && remaining_words.includes(current_word)) {
		used_words.push(current_word);
		localStorage.setItem("used_words", JSON.stringify(used_words));
		remaining_words = remaining_words.filter(x => x !== current_word);
	}
	if (remaining_words.length == 0) {
		current_word = null;
		localStorage.removeItem("current_word");
		document.getElementById('word').innerHTML = "<small>Došla slova</small>";
	} else {
		current_word = remaining_words[Math.floor(Math.random() * remaining_words.length)];
		localStorage.setItem("current_word", current_word);
		document.getElementById('word').innerText = current_word;
	}
	updateStatistics();
}

function resetUsedWords() {
	used_words = [];
	localStorage.setItem("used_words", JSON.stringify(used_words));
	remaining_words = Array.from(words);
	updateStatistics();
}

// load datasets
Promise.all(Object.entries(datasets).map(async (entry) => {
	console.log(entry);
	const response = await fetch(entry[1].filename).then((r) => r.text());
	return [entry[0], response.split("\n").map(e => e.trim()).filter(x => x != "")];
})).then((result) => {
	result.forEach(dataset => {
		dataset_words[dataset[0]] = dataset[1];
	});
	init();
});
