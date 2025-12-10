# MongoDB Firewall Configuration Guide

## For the Person Running MongoDB (Remote Computer)

To allow your computer to connect to MongoDB, the person running MongoDB needs to configure Windows Firewall.

### Option 1: Using Windows Firewall GUI (Easiest)

1. **Open Windows Firewall:**
   - Press `Win + R`
   - Type: `wf.msc`
   - Press Enter

2. **Create Inbound Rule:**
   - Click "Inbound Rules" in the left panel
   - Click "New Rule..." in the right panel
   - Select "Port" → Click "Next"
   - Select "TCP" → Enter port: `27017` → Click "Next"
   - Select "Allow the connection" → Click "Next"
   - Check all profiles (Domain, Private, Public) → Click "Next"
   - Name it: "MongoDB Port 27017" → Click "Finish"

3. **Verify:**
   - You should see "MongoDB Port 27017" in the Inbound Rules list
   - Make sure it's enabled (green checkmark)

### Option 2: Using PowerShell (Faster)

Run this command **on the MongoDB server computer** (as Administrator):

```powershell
New-NetFirewallRule -DisplayName "MongoDB Port 27017" -Direction Inbound -LocalPort 27017 -Protocol TCP -Action Allow
```

### Option 3: Temporarily Disable Firewall (For Testing Only)

⚠️ **Warning:** Only for testing! Re-enable after testing.

1. Open Windows Defender Firewall
2. Click "Turn Windows Defender Firewall on or off"
3. Turn off firewall for Private network (temporarily)
4. Test your connection
5. **Re-enable firewall after testing**

### Verify Firewall Rule is Working

On the MongoDB server, test if the port is open:

```powershell
# Check if port 27017 is listening
netstat -an | findstr 27017
```

You should see something like:
```
TCP    0.0.0.0:27017          0.0.0.0:0              LISTENING
```

---

## Additional MongoDB Configuration

The person running MongoDB also needs to ensure MongoDB is configured to accept remote connections:

### Check MongoDB Configuration

1. **Find MongoDB config file:**
   - Usually at: `C:\Program Files\MongoDB\Server\<version>\bin\mongod.cfg`
   - Or check MongoDB service settings

2. **Edit `mongod.cfg`:**
   ```yaml
   net:
     port: 27017
     bindIp: 0.0.0.0  # This allows connections from any IP
   ```

3. **Restart MongoDB service:**
   ```powershell
   # Stop MongoDB
   net stop MongoDB
   
   # Start MongoDB
   net start MongoDB
   ```

### Alternative: Start MongoDB with Command Line

If starting MongoDB manually:

```bash
mongod --bind_ip 0.0.0.0 --port 27017
```

---

## Testing the Connection

After firewall is configured, test from your computer:

```bash
# Test network connectivity
ping 192.168.145.109

# Test MongoDB port (if you have telnet)
telnet 192.168.145.109 27017

# Or test with your app
# Visit: http://localhost:3000
```

---

## Summary Checklist for MongoDB Admin

- [ ] Windows Firewall allows port 27017 (inbound rule)
- [ ] MongoDB is configured with `bindIp: 0.0.0.0`
- [ ] MongoDB service is running
- [ ] Both computers are on the same network
- [ ] IP address is correct (192.168.145.109)

---

## Quick Message to Send to MongoDB Admin

Copy and send this:

---

Hi,

I need to connect to MongoDB at `192.168.145.109:27017`. Can you please:

1. **Open Windows Firewall** (Win+R → `wf.msc`)
2. **Create Inbound Rule:**
   - New Rule → Port → TCP → Port 27017 → Allow
3. **Verify MongoDB config** has `bindIp: 0.0.0.0` (not just 127.0.0.1)
4. **Restart MongoDB** service

After that, I should be able to connect. Thanks!

---

