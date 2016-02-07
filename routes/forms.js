'use strict'
// Prefix: /news

var express = require('express');

var Form = require('../models/form');

var authutils = require('../util/auth')

var router = express.Router();

router.get('/', (req, res, next) => {
  authutils.return_user(req.get('token'))
           .then(user => {
             let group = user.group;
             Form.find({group: {
               $le: group
             }}).then(forms => req.json(forms))
           }).catch(next)
           .catch(next)
})

/*
Hello Friend,
How has it been?

Ain't it wonderful, 
You've got a friend?

Cause though we've changed
In our endeavors

I found we still 
Have some things in common

Now ain't it strange
And wonderful?

That we're still friends
We're,... we're still friends

Through our hearts,
We've never parted.

And through our living

We're friends, and friends,
And friendships are

And the way we are
When we're together

Let's know that we still
Have one another

Now ain't it strange
And wonderful?

That we're still friends
We're still friends
We're still friends.
We're still friends.
*/