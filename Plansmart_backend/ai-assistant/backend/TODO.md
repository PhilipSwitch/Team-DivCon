# TODO: Enhance AI Functionality for Schedule Creation and Modification

- [ ] Connect text input in script.js to process input like voice input
- [ ] Extend parse_input in app.py to detect update schedule commands (e.g., "update schedule [title] to [new time]")
- [ ] Add /update_schedule endpoint in app.py to handle updating schedules in the database
- [ ] Extend parse_input to detect commands like "show done tasks" or "show undone tasks"
- [ ] Modify /get_tasks endpoint in app.py to accept query parameters for filtering done/undone tasks
- [ ] Update script.js to load filtered tasks based on parsed commands if applicable
- [ ] Test voice and text inputs for creating tasks/schedules
- [ ] Test update schedule commands
- [ ] Test check done/undone commands
- [ ] Run the Flask app and frontend to verify overall functionality
