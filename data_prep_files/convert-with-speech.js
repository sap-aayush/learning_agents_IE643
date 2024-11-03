let Convert = {};
let SRE = null;

Convert.textAreas = {
  input: null,
  mathspeak: null,
  clearspeak: null
};

Convert.radios = {
  format: null,
};

Convert.selectors = {
  locale: null,
  markup: null,
  style: null,
};

Convert.divs = {
  preferences: null,
  rendered: null
};

Convert.state = {
  clearspeak: true,
  preferences: []
};

Convert.getElements = function() {
  for (let key of Object.keys(Convert.textAreas)) {
    Convert.textAreas[key] = document.getElementById(key);
  }
  for (let key of Object.keys(Convert.selectors)) {
    Convert.selectors[key] = document.getElementById(key);
  }
  for (let key of Object.keys(Convert.divs)) {
    Convert.divs[key] = document.getElementById(key);
  }
  for (let key of Object.keys(Convert.radios)) {
    Convert.radios[key] = Array.from(document.getElementsByName(key));
  }
};

Convert.setupSre = function() {
  for (let [loc, lang] of SRE.locales.entries()) {
    let option = document.createElement('option');
    option.innerHTML = lang;
    option.setAttribute('value', loc);
    if (loc === 'en') {
      option.setAttribute('selected', true);
    }
    Convert.selectors.locale.appendChild(option);
  }
  return Convert.updatePreferences('en');
};

Convert.init = function() {
  SRE = MathJax._.a11y.sre.Sre;
  Convert.getElements();
  Convert.setupSre();
};


Convert.setPreferences = function(locale) {
  Convert.divs.preferences.innerHTML = '';
  Convert.state.preferences = [];
  let prefs = SRE.clearspeakPreferences.getLocalePreferences()[locale];
  if (!prefs) {
    Convert.state.clearspeak = false;
    Convert.textAreas.clearspeak.innerHTML = '';
    return;
  }
  Convert.state.clearspeak = true;
  let table = document.createElement('table');
  let count = 0;
  let row = null;
  let multiline = {};
  for (let [pref, values] of Object.entries(prefs)) {
    if (pref.match(/^MultiLine/)) {
      multiline[pref] = values;
      continue;
    }
    if (count % 3 === 0) {
      row = document.createElement('tr');
      table.appendChild(row);
    }
    let cell1 = document.createElement('td');
    row.appendChild(cell1);
    let label = document.createElement('label');
    label.innerHTML = pref;
    label.setAttribute('for', pref);
    cell1.appendChild(label);
    let cell2 = document.createElement('td');
    row.appendChild(cell2);
    let select = document.createElement('select');
    Convert.state.preferences.push(select);
    select.setAttribute('onchange', 'Convert.computeClearspeak()');
    select.id = pref;
    for (let value of values) {
      let option = document.createElement('option');
      option.setAttribute('value', value);
      option.innerHTML = value.replace(RegExp(`^${pref}_`), '');
      select.appendChild(option);
    }
    cell2.appendChild(select);
    count++;
  }
  Convert.divs.preferences.appendChild(table);
  let label = document.createElement('label');
  label.innerHTML = 'Multiline:';
  Convert.divs.preferences.appendChild(label);
  for (let [pref, values] of Object.entries(multiline)) {
    let mlabel = document.createElement('label');
    mlabel.innerHTML = pref.replace('MultiLine', '');
    let select = document.createElement('select');
    Convert.state.preferences.push(select);
    select.setAttribute('onchange', 'Convert.computeClearspeak()');
    select.id = pref;
    for (let value of values) {
      let option = document.createElement('option');
      option.setAttribute('value', value);
      option.innerHTML = value.replace(RegExp(`^${pref}_`), '');
      select.appendChild(option);
    }
    mlabel.appendChild(select);
    label.appendChild(mlabel);
  }
};


Convert.updatePreferences = async function(locale) {
  return SRE.setupEngine({locale: locale}).
    then(() => {Convert.setPreferences(locale);});
};


Convert.computeClearspeak = async function() {
  return Convert.computeSpeech(
    Convert.textAreas.clearspeak, 'clearspeak',
    Convert.state.preferences.map((x) => x.value).join(':'));
};


Convert.computeMathspeak = async function() {
  return Convert.computeSpeech(
    Convert.textAreas.mathspeak, 'mathspeak', Convert.selectors.style.value);
};


Convert.computeSpeech = async function(node, domain, style) {
  let locale = Convert.selectors.locale.value;
  let modality = locale === 'nemeth' ? 'braille' : 'speech';
  return SRE.setupEngine(
    {locale: locale, domain: domain, modality: modality,
     style: style, markup: Convert.selectors.markup.value, pprint: true
    }).then(() => node.innerHTML = SRE.toSpeech(Convert.input2Mathml()));
};

Convert.convertLaTeXListToClearspeak = async function(latexList) {
  let clearspeakOutputs = [];

  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');

  progressContainer.style.display = 'block'; // Show the progress bar

  progressBar.style.width = '0';
  progressBar.innerText = '0%';

  for (let i = 0; i < latexList.length; i++) {
      const formula = latexList[i];

      Convert.textAreas.input.value = formula; // Set the input to the current LaTeX formula

      // Create a promise that resolves after 5 seconds
      const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      try {
          await Promise.race([
              Convert.render(), // The rendering promise
              timeoutPromise // The timeout promise
          ]);

          await Promise.race([
              Convert.computeClearspeak(), // The conversion promise
              timeoutPromise // The timeout promise
          ]);

          clearspeakOutputs.push(Convert.textAreas.clearspeak.innerHTML); // Store the Clearspeak output
      } catch (error) {
          // console.warn(`Skipping formula "${formula}": ${error.message}`); // Log the error
          clearspeakOutputs.push("Warning"); // Push "Warning" to outputs
      }

      // Update progress bar
      const progressPercentage = ((i + 1) / latexList.length) * 100;
      progressBar.style.width = progressPercentage + '%';
      progressBar.innerText = Math.round(progressPercentage) + '%';
  }

  const outputText = clearspeakOutputs.join("\n"); // Join the Clearspeak outputs with new lines
  Convert.saveToFile(outputText, "outputs.txt"); // Save the outputs to a file

  return clearspeakOutputs; // Return the Clearspeak outputs if needed elsewhere
};


// Function to save the Clearspeak output to a text file
Convert.saveToFile = function(content, filename) {
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};


Convert.input2Mathml = function() {
  let input = Convert.textAreas.input.value;
  if (!input) {
    return '';
  }
  switch (Convert.radioValue(Convert.radios.format)) {
  case 'latex':
    return MathJax.tex2mml(input);
  case 'asciimath':
    return MathJax.asciimath2mml(input);
  default:
    return input;
  }
};


Convert.radioValue = function(radios) {
  for (let radio of radios) {
    if (radio.checked) {
      return radio.value;
    }
  }
  return '';
};


Convert.convertExpression = async function() {
  // Convert.render();
  // await Convert.computeMathspeak();
  // if (Convert.state.clearspeak) {
  //   Convert.computeClearspeak();
  // }
  let latexFormulas = [
    '\\frac{a}{b}', 
    '\\int_{0}^{1} x^2 \\, dx', 
    '\\sum_{n=1}^{\\infty} \\frac{1}{n^2}'
  ];
  
  Convert.convertLaTeXListToClearspeak(latexFormulas);
};


Convert.render = function() {
  let input = Convert.textAreas.input.value;
  if (!input) {
    return '';
  }
  Convert.divs.rendered.innerHTML = '';
  switch (Convert.radioValue(Convert.radios.format)) {
  case 'latex':
    return Convert.divs.rendered.appendChild(MathJax.tex2svg(input));
  case 'asciimath':
    return Convert.divs.rendered.appendChild(MathJax.asciimath2svg(input));
  default:
    return Convert.divs.rendered.appendChild(MathJax.mathml2svg(input));
  }
};

Convert.updateLocale = function(value) {
  Convert.updatePreferences(value).then(Convert.convertExpression);
};


