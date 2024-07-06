// Function to remove all pins
function removeAllPins() {
    // Find all menu buttons
    const menuButtons = Array.from(document.querySelectorAll('.ContentListItemMenu-module_menuButton-YR6Mr'));

    // Log the number of menu buttons found
    console.log(`Found ${menuButtons.length} menu buttons.`);

    menuButtons.forEach((menuButton, index) => {
        setTimeout(() => {
            // Click the menu button to open the dropdown
            menuButton.click();

            setTimeout(() => {
                // Find and click the "Remove from Pins" button within the opened menu
                const removeButton = Array.from(document.querySelectorAll('button')).find(button => 
                    button.textContent.includes('Remove from Pins')
                );

                if (removeButton) {
                    removeButton.click();
                    console.log(`Clicked "Remove from Pins" button for menu button ${index + 1}.`);
                } else {
                    console.log(`No "Remove from Pins" button found for menu button ${index + 1}.`);
                }
            }, 200); // Adding a delay to ensure the menu has time to open
        }, index * 400); // Adding a delay between each menu button click to avoid overlap
    });

    // Log completion
    console.log('All pins have been processed for removal.');
}

// Execute the function
removeAllPins();
