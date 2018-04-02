import React from 'react';
import ReactDOM from 'react-dom';
import 'styles/index.css';
import App from 'components/App';
import registerServiceWorker from './registerServiceWorker';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment));

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
