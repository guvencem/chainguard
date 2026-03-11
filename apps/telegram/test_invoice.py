import os
import asyncio
import logging
from telegram import LabeledPrice, Bot
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
logging.basicConfig(level=logging.INFO)

async def test_invoice():
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not bot_token:
        print("No BOT_TOKEN found.")
        return

    # User ID to send invoice to (we will run the Python script and print the error)
    # We will send it to a specific chat ID if provided, or print errors
    # Let's just create the Bot object and see if it validates
    
    bot = Bot(token=bot_token)
    try:
        me = await bot.get_me()
        print(f"Bot authenticated: {me.username}")
        # Need a chat ID to test sending... we can try to getupdates to find the user's chat ID
        updates = await bot.get_updates(limit=1, timeout=10)
        if updates:
            chat_id = updates[0].message.chat_id if updates[0].message else (updates[0].callback_query.message.chat_id if updates[0].callback_query else None)
            if chat_id:
                print(f"Sending invoice to chat_id: {chat_id}")
                await bot.send_invoice(
                    chat_id=chat_id,
                    title="Test Stars",
                    description="Testing Telegram Stars checkout",
                    payload="test_stars_payload",
                    provider_token="",  # Critical for XTR
                    currency="XTR",
                    prices=[LabeledPrice("1 Star", 1)]
                )
                print("Invoice sent successfully.")
            else:
                print("Could not extract chat_id from updates.")
        else:
            print("No recent updates found to extract chat ID. Please send a message to the bot first.")
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test_invoice())
