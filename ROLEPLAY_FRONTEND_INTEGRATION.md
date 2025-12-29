# Roleplay Frontend Integration - Exact Implementation Guide

## ✅ Visual Requirements (From Screenshot)

Based on your screenshot, the roleplay interface should display:

1. **Situational Cues** (body language, environmental context)
   - Displayed in **muted gray/slate color** (`text-slate-500`)
   - **Italic** text style
   - No icons, no background boxes - just plain italic gray text
   - Appears as separate paragraphs from dialogue

2. **Dialogue Text**
   - Normal foreground color (`text-foreground`)
   - Regular (non-italic) text style
   - Appears as separate paragraphs from cues

3. **Layout**
   - Cues and dialogue are separated into distinct paragraphs
   - Clear visual differentiation through color and style
   - Natural reading flow

---

## 📝 Example from Screenshot

**Scenario:** ADC Integration with IO Backbone  
**HCP:** Dr. Robert Chen - Hematology/Oncology, Community Practice  
**Difficulty:** Advanced

**Initial Cue (Gray Italic):**
> Dr. Chen types a few notes, briefly shifts his gaze to the clock, and then back to his computer screen. A stack of patient charts sits next to the monitor, and there's a coffee stain on his white coat, hinting at a busy morning. Without turning, he gestures towards a chair.

**Dialogue (Normal Text):**
> "You've got a few minutes before I need to head to the tumor board. What's the focus of your visit today?"

**Additional Cue (Gray Italic):**
> He continues typing, clearly multitasking but receptive to concise information.

---

## 🔧 Implementation Steps

### Step 1: Update Roleplay Page Component

Open `src/pages/roleplay.tsx` and import the cue parser:

```tsx
import { RoleplayMessageWithBlockCues } from '@/components/RoleplayCueParser';
```

### Step 2: Replace Message Rendering

**Find the current message rendering code** (likely looks like this):

```tsx
// OLD CODE - Replace this
<div className="message-content">
  {message.content}
</div>
```

**Replace with:**

```tsx
// NEW CODE - Use RoleplayMessageWithBlockCues
<RoleplayMessageWithBlockCues content={message.content} />
```

### Step 3: Full Message Component Example

```tsx
function RoleplayMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const isHCP = message.role === 'assistant' || message.role === 'stakeholder';

  return (
    <div className={cn(
      "flex gap-3 p-4 rounded-lg",
      isUser ? "bg-primary/5" : "bg-muted/50"
    )}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 space-y-1">
        <div className="font-semibold text-sm">
          {isUser ? 'You' : 'Dr. Chen'}
        </div>
        
        {/* Use RoleplayMessageWithBlockCues for HCP messages */}
        {isHCP ? (
          <RoleplayMessageWithBlockCues content={message.content} />
        ) : (
          <p className="text-foreground leading-relaxed">{message.content}</p>
        )}
      </div>
    </div>
  );
}
```

---

## 🎨 Visual Styling Reference

### Cue Styling (Muted Gray Italic)
```tsx
<p className="text-slate-500 dark:text-slate-400 italic leading-relaxed">
  Dr. Chen types a few notes, briefly shifts his gaze to the clock...
</p>
```

### Dialogue Styling (Normal Text)
```tsx
<p className="text-foreground leading-relaxed">
  "You've got a few minutes before I need to head to the tumor board."
</p>
```

---

## 📊 API Response Format

The backend API returns messages with embedded cues:

```json
{
  "message": "*Dr. Chen gives a polite nod but maintains his focus on the screen for a moment before turning to face you, signaling a readiness to engage in the conversation.* \"I'm managing through a busy schedule, but thank you for asking. Let's dive into why you're here today. What do you have that's relevant for the patients we treat here?\" *He leans slightly forward, expressing a willingness to listen.*",
  "eqAnalysis": { ... },
  "signals": [ ... ]
}
```

**The `RoleplayMessageWithBlockCues` component automatically:**
1. Parses text to extract cues (wrapped in `*asterisks*`)
2. Separates cues from dialogue
3. Renders cues in gray italic
4. Renders dialogue in normal text
5. Displays as separate paragraphs

---

## 🧪 Testing the Integration

### 1. Start a Roleplay Session

```bash
curl -X POST http://localhost:20000/api/roleplay/start \
  -H "Content-Type: application/json" \
  -d '{
    "scenarioId": "oncology-adc-integration",
    "difficulty": "advanced"
  }'
```

### 2. Verify Visual Output

**Expected Result:**
- Initial cue appears in gray italic text
- Dialogue appears in normal text
- Clear visual separation between cues and dialogue
- Matches screenshot appearance

### 3. Send a Response

```bash
curl -X POST http://localhost:20000/api/roleplay/respond \
  -H "Content-Type: application/json" \
  -H "x-session-id: <session-id>" \
  -d '{
    "message": "Hello doctor, how are you?"
  }'
```

**Expected Result:**
- HCP response includes situational cues
- Cues are rendered in gray italic
- Dialogue is rendered in normal text

---

## 🎯 Key Points

1. **Use `RoleplayMessageWithBlockCues`** for HCP messages (not `RoleplayMessageContent`)
2. **Block-style layout** matches screenshot (paragraph-based, not inline)
3. **Muted gray color** for cues (`text-slate-500`)
4. **Italic styling** for cues
5. **No icons or backgrounds** - clean, simple text differentiation
6. **Automatic parsing** - component handles everything

---

## 📚 Component API

### `RoleplayMessageWithBlockCues`

**Props:**
- `content: string` - The full message text with embedded cues

**Behavior:**
- Parses `*cue text*` patterns
- Renders cues as gray italic paragraphs
- Renders dialogue as normal paragraphs
- Maintains proper spacing between elements

**Example Usage:**
```tsx
<RoleplayMessageWithBlockCues 
  content="*Dr. Chen nods* That's interesting. *Leans forward* Tell me more." 
/>
```

**Rendered Output:**
```html
<div class="space-y-2">
  <p class="text-slate-500 italic">Dr. Chen nods</p>
  <p class="text-foreground">That's interesting.</p>
  <p class="text-slate-500 italic">Leans forward</p>
  <p class="text-foreground">Tell me more.</p>
</div>
```

---

## ✅ Integration Checklist

- [ ] Import `RoleplayMessageWithBlockCues` in `roleplay.tsx`
- [ ] Replace plain text rendering with component
- [ ] Test with mock API responses
- [ ] Verify gray italic styling for cues
- [ ] Verify normal text styling for dialogue
- [ ] Verify paragraph-based layout
- [ ] Test in both light and dark modes
- [ ] Confirm matches screenshot appearance

---

## 🎉 Result

After integration, your roleplay interface will display:

✅ **Situational cues** in muted gray italic text  
✅ **Dialogue** in normal foreground text  
✅ **Clear visual separation** between cues and dialogue  
✅ **Professional, clean appearance** matching your screenshot  
✅ **Automatic parsing** of cue markers from API responses  

**The roleplay experience will feel more immersive and realistic with clear visual differentiation between observable behaviors and spoken dialogue!**
