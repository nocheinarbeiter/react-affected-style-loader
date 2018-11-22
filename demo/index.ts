import * as ReactDOM from 'react-dom';
import * as React from 'react';
import * as $ from './style.css';


window.onload = function() {
    ReactDOM.render(
        $.foo(
            {mods: {mod: true}},
            $.bar('test'),
        ),
        document.body.firstElementChild
    );
};
