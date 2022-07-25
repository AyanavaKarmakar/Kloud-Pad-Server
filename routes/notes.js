const router = require('express').Router();
var fetchUser = require('../middleware/fetchUser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');


// Route 1: get all the notes using: GET "/api/notes/fetch-all-notes". login required
router.get('/fetch-all-notes', fetchUser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error. Please try again!");
    }
})

// Route 2: add a new note using POST: "/api/notes/add-note". login required
router.post('/add-note', fetchUser, [
    body('title', 'Title must be of atleast 3 characters!').isLength({ min: 3 }),
    body('description', 'Description must be of atleast 5 characters!').isLength({ min: 5 }),
], async (req, res) => {

    try {

        const errors = validationResult(req);

        // if there are errors, return Bad Request and the errors
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, tag } = req.body;

        const note = new Notes({
            title,
            description,
            tag,
            user: req.user.id
        });

        const savedNote = await note.save()
        res.json(savedNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error. Please try again!");
    }
})

// Route 3: update an existing note using PATCH: "/api/notes/update-note/id". login required. id required
/*
    1. PATCH as it name says, it updates only the data which we changed and doesn't sends whole payload.
    2. PUT sends the whole body payload and pastes into the DB which might not be good for overall performance of the API when scaled it.

    Example:
    There's a box of 3 colors RGB and say you want to replace red with white so you'll just replace that red bottle, right? So that's what PATCH does that it only updates that specific field by sending over the network. But PUT will change whole box with a new box with WGB colors which may increase the stress on network due to complete payload body if there's a heavy JSON transferred.
*/
router.patch('/update-note/:id', fetchUser, async (req, res) => {

    const { title, description, tag } = req.body;

    try {

        // create a new note object
        const newNote = {};

        if (title) { newNote.title = title; }
        if (description) { newNote.description = description; }
        if (tag) { newNote.tag = tag; }

        // find the note to be updated and update it
        let note = await Notes.findById(req.params.id);

        if (!note) { return res.status(404).send("Not Found!"); }

        if (note.user.toString() !== req.user.id) { return res.status(401).send("Not Allowed!"); }

        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({ note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error. Please try again!");
    }
})

// Route 4: delete an existing note using DELETE: "/api/notes/delete-note/id". login required
router.delete('/delete-note/:id', fetchUser, async (req, res) => {

    try {

        // find the note to be deleted and delete it
        let note = await Notes.findById(req.params.id);

        if (!note) { return res.status(404).send("Not Found!"); }

        // allow deletion only if user owns this particular note
        if (note.user.toString() !== req.user.id) { return res.status(401).send("Not Allowed!"); }

        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Note has been deleted!", note: note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error. Please try again!");
    }
})


module.exports = router;