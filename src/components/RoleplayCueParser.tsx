// Frontend component for parsing and rendering situational cues in roleplay responses

import { Eye, MessageCircle } from 'lucide-react';

interface ParsedSegment {
  type: 'text' | 'cue';
  content: string;
}

// Parse response text to separate cues (*wrapped in asterisks*) from dialogue
// Preserves whitespace around text segments to avoid word concatenation
export function parseRoleplayResponse(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  const cuePattern = /\*([^*]+)\*/g;
  let lastIndex = 0;
  let match;

  while ((match = cuePattern.exec(text)) !== null) {
    // Add text before the cue (preserve original spacing, only skip if truly empty)
    if (match.index > lastIndex) {
      const textContent = text.slice(lastIndex, match.index);
      // Only add if there's non-whitespace content, but preserve the spacing
      if (textContent.trim()) {
        segments.push({ type: 'text', content: textContent });
      }
    }
    // Add the cue (trim the cue content itself for cleaner display)
    segments.push({ type: 'cue', content: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last cue (preserve original spacing)
  if (lastIndex < text.length) {
    const textContent = text.slice(lastIndex);
    if (textContent.trim()) {
      segments.push({ type: 'text', content: textContent });
    }
  }

  // If no cues found, return entire text as single segment
  if (segments.length === 0 && text.trim()) {
    segments.push({ type: 'text', content: text });
  }

  return segments;
}

// Styled cue component with burnt orange theme and eye icon (matches screenshot)
export function SituationalCue({ content }: { content: string }) {
  return (
    <span 
      className="inline-flex items-center gap-1.5 px-2 py-0.5 mx-1 rounded-md bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800"
      data-testid="situational-cue"
    >
      <Eye className="h-3 w-3 text-orange-600 dark:text-orange-400 flex-shrink-0" />
      <span className="text-orange-700 dark:text-orange-300 text-sm italic">
        {content}
      </span>
    </span>
  );
}

// Full message renderer that parses and displays cues inline
export function RoleplayMessageContent({ content }: { content: string }) {
  const segments = parseRoleplayResponse(content);

  return (
    <div className="leading-relaxed space-y-1">
      {segments.map((segment, index) => (
        segment.type === 'cue' ? (
          <div key={index} className="block">
            <SituationalCue content={segment.content} />
          </div>
        ) : (
          <span key={index} className="text-foreground">{segment.content}</span>
        )
      ))}
    </div>
  );
}

// Alternative: Block-style cue display with burnt orange styling and eye icon
export function RoleplayMessageWithBlockCues({ content }: { content: string }) {
  const segments = parseRoleplayResponse(content);

  return (
    <div className="space-y-2">
      {segments.map((segment, index) => (
        segment.type === 'cue' ? (
          <div key={index} className="flex items-start gap-2 px-3 py-2 rounded-md bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
            <Eye className="h-4 w-4 mt-0.5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <p className="text-orange-700 dark:text-orange-300 italic leading-relaxed">
              {segment.content}
            </p>
          </div>
        ) : (
          <p key={index} className="text-foreground leading-relaxed">
            {segment.content}
          </p>
        )
      ))}
    </div>
  );
}

// Signal Intelligence integration - extract signals for the panel
export interface ExtractedSignal {
  id: string;
  type: 'verbal' | 'engagement' | 'contextual' | 'conversational';
  signal: string;
  interpretation: string;
  suggestedResponse: string;
  timestamp: string;
}

export function extractSignalsFromCues(content: string): ExtractedSignal[] {
  const segments = parseRoleplayResponse(content);
  const cues = segments.filter(s => s.type === 'cue');

  return cues.map(cue => ({
    id: crypto.randomUUID(),
    ...interpretCue(cue.content),
    timestamp: new Date().toISOString()
  }));
}

function interpretCue(cue: string): Omit<ExtractedSignal, 'id' | 'timestamp'> {
  const cueLower = cue.toLowerCase();

  // Engagement signals
  if (cueLower.includes('lean') && cueLower.includes('forward')) {
    return {
      type: 'engagement',
      signal: cue,
      interpretation: 'HCP is showing increased interest in this topic',
      suggestedResponse: 'Good opportunity to provide more detail or ask a discovery question'
    };
  }
  if (cueLower.includes('nod')) {
    return {
      type: 'engagement',
      signal: cue,
      interpretation: 'HCP appears to agree or understand the point',
      suggestedResponse: 'Continue building on this topic or move to next key message'
    };
  }

  // Disengagement signals
  if (cueLower.includes('glance') && (cueLower.includes('watch') || cueLower.includes('clock'))) {
    return {
      type: 'contextual',
      signal: cue,
      interpretation: 'Time pressure signal - HCP may be feeling rushed',
      suggestedResponse: 'Consider summarizing key points or asking about priorities'
    };
  }
  if (cueLower.includes('cross') && cueLower.includes('arm')) {
    return {
      type: 'engagement',
      signal: cue,
      interpretation: 'Possible resistance or skepticism',
      suggestedResponse: 'Acknowledge their perspective, ask an open-ended question'
    };
  }

  // Environmental signals
  if (cueLower.includes('phone') || cueLower.includes('pager') || cueLower.includes('buzz')) {
    return {
      type: 'contextual',
      signal: cue,
      interpretation: 'External interruption - may affect attention',
      suggestedResponse: 'Offer to pause or recap when they return focus'
    };
  }
  if (cueLower.includes('nurse') || cueLower.includes('staff') || cueLower.includes('enter')) {
    return {
      type: 'contextual',
      signal: cue,
      interpretation: 'Clinical environment interruption',
      suggestedResponse: 'Remain patient, acknowledge the demands of their role'
    };
  }

  // Body language signals
  if (cueLower.includes('frown') || cueLower.includes('furrow')) {
    return {
      type: 'verbal',
      signal: cue,
      interpretation: 'Possible confusion or concern about what was said',
      suggestedResponse: 'Clarify or ask if they have questions about the point'
    };
  }
  if (cueLower.includes('eyebrow') || cueLower.includes('raise')) {
    return {
      type: 'verbal',
      signal: cue,
      interpretation: 'Curiosity or skepticism signal',
      suggestedResponse: 'Provide evidence or ask what specifically prompted the reaction'
    };
  }
  if (cueLower.includes('smile') || cueLower.includes('laugh')) {
    return {
      type: 'engagement',
      signal: cue,
      interpretation: 'Positive rapport signal',
      suggestedResponse: 'Good moment to reinforce relationship or transition topics'
    };
  }
  if (cueLower.includes('picks up') || cueLower.includes('reaches for')) {
    return {
      type: 'engagement',
      signal: cue,
      interpretation: 'HCP taking action - may indicate readiness to engage',
      suggestedResponse: 'Allow moment to complete, then continue or transition'
    };
  }

  // Default interpretation
  return {
    type: 'contextual',
    signal: cue,
    interpretation: 'Observable behavior that may provide context',
    suggestedResponse: 'Continue observing and adapt approach as needed'
  };
}
