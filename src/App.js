import './App.css';
import {
  useSession,
  useSupabaseClient, useSessionContext
} from "@supabase/auth-helpers-react";
import DateTimePicker from 'react-datetime-picker';
import { useState } from 'react';

export default function App() {
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [attendees, setAttendees] = useState("");

  const session = useSession() //tokens, wehn session exists we have a user
  const supabase = useSupabaseClient() //talk to supabase
  const {isLoading} = useSessionContext()

function getRandonString(length) {
   var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
   var charLength = chars.length;
   var result = '';
   for ( var i = 0; i < length; i++ ) {
      result += chars.charAt(Math.floor(Math.random() * charLength));
   }
   return result;
}
 

  if (isLoading){
    return <></>
  }

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/calendar",
      },
    });
    if (error) {
      alert("Error logging in to Google provider with Supabase");
      console.log(error);
    }}

    async function signOut() {
        await supabase.auth.signOut();
      
}

async function createCalendarEvent() {
  console.log("creating calendar event")
  const event = {
    summary: eventName,
    description: eventDescription,
    start: {
      dateTime: start.toISOString(), // Date.toISOString() ->
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: end.toISOString(), // Date.toISOString() ->
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    attendees:
      // you will need to run a check to ensure this is a correct email address as per https://datatracker.ietf.org/doc/html/rfc5322#section-3.4
      [
        //this will be the entered address
        { email: attendees, responseStatus: "needsAction" },
        //this will be the business owners address
        {
          email: session.user.email,
          responseStatus: "accepted",
          self: true,
        },
      ],
    conferenceData: {
      createRequest: {
        conferenceSolutionKey: { type: "hangoutsMeet" },
        requestId: getRandonString(22),
      },
    },
  };
  await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + session.provider_token, // Access token for google
        // conferenceDataVersion: 1
      },
      body: JSON.stringify(event),
    }
  )
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      console.log(data.conferenceData, data);
      alert("Event created, check your Google Calendar!");
    });
}

console.log(session)
console.log(session);
console.log(start);//this is the format needed: "2023-05-24T22:17:09-04:00"
console.log(end);
console.log(eventName);
console.log(eventDescription);
console.log(attendees);

  return (
    <div className="App">
      <div style={{
          width: "400px",
          margin: "30px auto",
          color: "black",
        }}>
          {session ? 
          <>
          <h2>Hi {session.user.email}</h2>
          <p>Start of your event</p>
            <DateTimePicker onChange={setStart} value={start}/>
            <p>End of your event</p>
            <DateTimePicker onChange={setEnd} value={end} />
            <p>Event name</p>
            <input type="text" onChange={(e) => setEventName(e.target.value)} />
            <p>Event description</p>
            <input
              type="text"
              onChange={(e) => setEventDescription(e.target.value)}
            />
            <p>Event attendees</p>
            <input type="text" onChange={(e) => setAttendees(e.target.value)} />
            <hr />
            <button onClick={() => createCalendarEvent()}>
              Create Calendar Event
            </button>
            <p></p>
          <button onClick={() => signOut()}>Sign out</button>
          </>
          :
          <>
          <button onClick={() => googleSignIn()}>Sign in with google</button> 
          {/* you can make this custom via supabase */}
          </>
          }
      </div>
      
    </div>
  );
}
