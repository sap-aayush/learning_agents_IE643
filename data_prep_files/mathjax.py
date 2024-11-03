from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time

# Path to your ChromeDriver
#CHROMEDRIVER_PATH = '/mnt/c/users/Naveen Lal/downloads/chromedriver-win64/chromedriver-win64.exe'
#CHROMEDRIVER_PATH = r'C:\\Users\\Naveen Lal\downloads\\chromedriver-win64\\chromedriver-win64.exe'
#chrome_driver_path = 'path_to_chromedriver'  # Replace with your chromedriver path
chrome_options = Options()
chrome_options.add_argument('--headless')  # Run Chrome in headless mode
chrome_options.add_argument('--no-sandbox')  # Bypass OS security model
chrome_options.add_argument('--disable-dev-shm-usage')  # Overcome limited resource problems
chrome_options.add_argument('--disable-gpu')  # Applicable to headless mode in some environments
chrome_options.add_argument('--remote-debugging-port=9222')  # Enable remote debugging


# Initialize the WebDriver (for Chrome)
#driver = webdriver.Chrome(executable_path=CHROMEDRIVER_PATH)
driver = webdriver.Chrome(options=chrome_options)

# Open the MathJax Speech Converter website
url = 'https://mathjax.github.io/MathJax-demos-web/speech-generator/convert-with-speech.html'
driver.get(url)

# Function to automate the process for each LaTeX formula
def process_formula(latex_formula):
    try:
        # Wait until the input field is present
        wait = WebDriverWait(driver, 10)
        
        # Locate the input field and clear it
        input_field = wait.until(EC.presence_of_element_located((By.ID, 'input')))
        input_field.clear()

        # Enter the LaTeX formula
        input_field.send_keys(latex_formula)

        # Select the AsciiMath radio button
        ascii_math_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'input[type="radio"][value="asciimath"]')))
        ascii_math_button.click()

        # Click the 'Convert' button
        convert_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'input[type="button"][value="Convert"]')))  # Use the button's attributes
        convert_button.click()

        # Wait for the ClearSpeak output to be populated
        clearspeak_output = wait.until(EC.presence_of_element_located((By.ID, 'clearspeak')))
        
        # Extract and return the ClearSpeak output
        return clearspeak_output.text

    except Exception as e:
        print(f"Error processing formula: {latex_formula} - {str(e)}")
        return None

# Load your LaTeX formulas from a file
with open("latex.txt",'r') as f, open('unstructured.txt', 'w') as fo:
    results = []
    i = 0
    for formula in f.readlines(): 
        output = process_formula(formula)
        fo.write(output + '\n')
        time.sleep(1)  # Add a small delay between each request
        if(i%5000 == 0):
            print(i)
        i = i + 1


# Close the browser
driver.quit()


# try:
#     driver.get(url)
#     print(driver.title)
# except WebDriverException as e:
#     print(f"Failed to connect to {url}: {e}")
# finally:
#     driver.quit()