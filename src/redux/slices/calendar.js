import { createSlice } from '@reduxjs/toolkit';
import { eventService } from 'src/composables/context-provider';
// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: null,
  events: [],
};

const slice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    // START LOADING
    startLoading (state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError (state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // GET EVENTS
    getEventsSuccess (state, action) {
      state.isLoading = false;
      state.events = action.payload;
    },

    // CREATE EVENT
    createEventSuccess (state, action) {
      // const newEvent = action.payload;
      state.isLoading = false;
      // state.events = [...state.events, newEvent];
    },

    // UPDATE EVENT
    updateEventSuccess (state, action) {
      state.isLoading = false;
      // state.events = state.events.map((event) => {
      //   if (event.id === action.payload.id) {
      //     return action.payload;
      //   }
      //   return event;
      // });
    },

    // DELETE EVENT
    deleteEventSuccess (state, action) {
      const eventId = action.payload;
      state.events = state.events.filter((event) => event.id !== eventId);
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getEvents () {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await eventService.getAll()
      dispatch(slice.actions.getEventsSuccess(response.map(item=> ({
          ...item,
          id: item._id,
          start: new Date(item.start).toISOString(),
          end: new Date(item.end).toISOString(),
          textColor: item.color,
          title: item.label,
          // display: 'background'
        }))));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function createEvent (newEvent) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await eventService.post(newEvent)
      dispatch(slice.actions.createEventSuccess(response));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function updateEvent (eventId, event) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await eventService.patch({
        _id: eventId,
        ...event
      })
      dispatch(slice.actions.updateEventSuccess(response));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function deleteEvent (eventId) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await eventService.delete({
        _id: eventId
      })
      dispatch(slice.actions.deleteEventSuccess(eventId));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
