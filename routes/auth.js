const router = require('express').Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'randomStringForJWT';
var fetchUser = require('../middleware/fetchUser');

// Route 1: create an user using: POST "/api/auth/create-user". no login required 
router.post('/create-user', [
    body('name', 'Enter a valid name!').isLength({ min: 3 }),
    body('email', 'Enter a valid email!').isEmail(),
    body('password', 'Password must be of atleast 5 characters!').isLength({ min: 5 }),

], async (req, res) => {

    // if there are errors, return Bad Request and the errors

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // check whether the user with this email exists already
    try {
        let user = await User.findOne({ email: req.body.email });

        // console.log(user);

        var success = true;

        if (user) {
            // success === true === 1, so, success - 1 === 1 - 1 === 0 = false
            // '!!' converts to bool
            success = !!(success - 1);
            return res.status(400).json({ error: 'An user with this email already exists!' });
        }

        const salt = await bcrypt.genSalt(10);
        const securedPassword = await bcrypt.hash(req.body.password, salt);


        // creates a new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: securedPassword
        })

        const data = {
            user: {
                id: user.id
            }
        }

        const authToken = jwt.sign(data, JWT_SECRET);
        // success === true
        res.json({ success, authToken: authToken });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error. Please try again!");
    }
})

// Route 2: authenticate an user using: POST "/api/auth/login". no login required
router.post('/login', [
    body('email', 'Enter a valid email!').isEmail(),
    body('password', 'Password cannot be blank!').exists(),
], async (req, res) => {
    const errors = validationResult(req);

    // if there are errors, return Bad Request and the errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ error: "Please try to login using correct credentials!" })
        }

        const passwordCompare = await bcrypt.compare(password, user.password);

        var success = true;

        if (!passwordCompare) {
            // success === true === 1, so, success - 1 === 1 - 1 === 0 = false
            // '!!' converts to bool
            success = !!(success - 1);
            return res.status(400).json({ success, error: "Please try to login using correct credentials!" })
        }

        const data = {
            user: {
                id: user.id
            }
        }


        const authToken = jwt.sign(data, JWT_SECRET);
        //  success === true
        res.json({ success, authToken: authToken });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error. Please try again!");
    }
})

// Route 3: get logged in user's details using: POST "/api/auth/user-details". login required
router.post('/user-details', fetchUser, async (req, res) => {



    try {
        let userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error. Please try again!");
    }
})

module.exports = router;