import BigCalendar from 'react-big-calendar';
import moment from 'moment';

BigCalendar.setLocalizer(
	BigCalendar.momentLocalizer(moment)
);