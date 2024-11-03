let latexFormulas = [
    '\\frac{a}{b}', 
    '\\int_{0}^{1} x^2 \\, dx', 
    '\\sum_{n=1}^{\\infty} \\frac{1}{n^2}'
  ];
  
  Convert.convertLaTeXListToClearspeak(latexFormulas).then((outputs) => {
    console.log(outputs);  // This will print the Clearspeak outputs to the console
  });
  