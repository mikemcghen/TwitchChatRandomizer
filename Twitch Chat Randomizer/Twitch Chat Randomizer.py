import os
import asyncio
import websockets
import requests
from colorama import Fore
from dotenv import load_dotenv

load_dotenv()

messages_dict = {}
keyword = 'Name:'
EXPRESS_SERVER_URL = 'http://localhost:5000/api/selected'

async def connect_to_twitch():
    uri = "wss://irc-ws.chat.twitch.tv:443"
    token = os.getenv("TWITCH_OAUTH_TOKEN")
    nickname = os.getenv("TWITCH_BOT_NICKNAME")
    channel = os.getenv("TWITCH_CHANNEL").lstrip('#')

    if not token or not nickname or not channel:
        print(Fore.RED + "Missing one or more environment variables. Please check TWITCH_OAUTH_TOKEN, TWITCH_BOT_NICKNAME, and TWITCH_CHANNEL.")
        return

    print(f"Token: {token}")
    print(f"Nickname: {nickname}")
    print(f"Channel: {channel}")

    while True:  
        try:
            print(Fore.BLUE + "Attempting to connect to Twitch IRC...")
            async with websockets.connect(uri) as websocket:
                print(Fore.BLUE + "Connection established. Sending authentication...")
                await websocket.send(f"PASS {token}")
                print(Fore.BLUE + "Sent PASS")
                await websocket.send(f"NICK {nickname}")
                print(Fore.BLUE + "Sent NICK")
                await websocket.send(f"JOIN #{channel}")
                print(Fore.BLUE + f"Sent JOIN for channel #{channel}")
                print(Fore.GREEN + "Connected to Twitch IRC and joined the channel.")
                print(Fore.BLUE + "Waiting to receive messages...")

                while True: 
                    try:                        
                        message = await websocket.recv()
                        if "PRIVMSG" in message:
                            await handle_message(message)
                    except websockets.exceptions.ConnectionClosedError as e:
                        print(Fore.RED + f"Connection closed unexpectedly: {e}")
                        break
                    except Exception as e:
                        print(Fore.RED + f"An error occurred while receiving message: {e}")
                        break

        except Exception as e:
            print(Fore.RED + f"An error occurred during connection: {e}")
            print(Fore.YELLOW + "Attempting to reconnect in 5 seconds...")
            await asyncio.sleep(5)  

async def handle_message(message):
    try:
        parts = message.split(':', 2)
        if len(parts) < 3:
            print(Fore.RED + "Invalid message format")
            return None

        username_section = parts[1]
        user_message = parts[2].strip()
        username = username_section.split('!', 1)[0]

        print(Fore.CYAN + f"{username}: {user_message}")
        if username == 'procptcasual' and user_message == 'clear':
            messages_dict.clear()
            print(Fore.YELLOW + "Cleared the messages dictionary.")
        elif(username == 'procptcasual' and user_message == 'select'):
            await send_to_server(messages_dict)
            messages_dict.clear()
        elif user_message.startswith(keyword):
            modified_message = user_message.replace(keyword, '').strip()
            await add_message_to_dict((username, modified_message))
        else:
            return
    except Exception as e:
        print(Fore.RED + f"An error occurred while handling message: {e}")

async def add_message_to_dict(user_message_tuple):
    try:
        if user_message_tuple:
            username, user_message = user_message_tuple
            messages_dict[username] = user_message
            print(Fore.YELLOW + f"Added message to dictionary: {username} -> {user_message}")
    except Exception as e:
        print(Fore.RED + f"An error occurred while adding message to dictionary: {e}")

async def send_to_server(messages):
    try:
        response = requests.post(EXPRESS_SERVER_URL, json=messages)
        if response.status_code == 200:
            print(Fore.GREEN + "Successfully sent data to server.")
        else:
            print(Fore.RED + f"Failed to send data to server. Status code: {response.status_code}")
    except Exception as e:
        print(Fore.RED + f"An error occurred while sending data to server: {e}")

if __name__ == "__main__":
    asyncio.run(connect_to_twitch())
