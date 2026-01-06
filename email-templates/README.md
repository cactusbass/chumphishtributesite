# Chum Email Templates

## Quick Start

### show-announcement.html
A polished HTML email template for announcing upcoming shows.

**To preview:** Open the file in any browser.

**To update for a new show:**
1. Open `show-announcement.html` in a text editor
2. Find and replace these placeholders:
   - Show date (line ~79): "Saturday, February 15"
   - Venue name (line ~91): "The Ivy Room"
   - Venue address (line ~94): "860 San Pablo Ave, Albany, CA"
   - Doors time (line ~102): "8:00 PM"
   - Show time (line ~109): "9:00 PM"
   - Ticket price (line ~116): "$15 adv / $20 door"
   - Ticket link (line ~127): the eventbrite/ticket URL
   - Hero image (line ~49): swap the image URL for your show poster
   - Teaser text (line ~122): your custom message

**To send via Gmail:**

Option A - Copy/paste the rendered email:
1. Open the HTML file in Chrome
2. Select all (Cmd+A) and copy (Cmd+C)
3. Paste directly into Gmail compose window
4. Gmail will preserve most formatting

Option B - Use an extension:
- Install "HTML Inserter for Gmail" Chrome extension
- Compose email, click the extension icon
- Paste the HTML source code

Option C - Use a service:
- Paste the HTML into Mailchimp/Buttondown as a campaign
- Send from there (better tracking, proper unsubscribe)

## Image Hosting

For the hero image to work in emails, it needs to be hosted online. Options:

1. **Use your website** - Upload to `chumphishtribute.com/Images/`
2. **Use Imgur** - Quick and free
3. **Use Google Drive** - Make the image public, get shareable link

Recommended image size: 600px wide (any height)

## Tips

- Always send yourself a test email first
- Gmail may strip some styles - test on mobile too
- Images don't load by default in many email clients - make sure the email still makes sense without them
- Keep the email under 100KB total for best deliverability
