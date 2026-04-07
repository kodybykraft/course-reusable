'use client';

interface LessonContent {
  contentType: 'video' | 'text' | 'pdf' | 'audio' | 'embed';
  contentUrl?: string | null;
  contentText?: string | null;
}

interface LessonPlayerProps {
  lesson: {
    id: string;
    title: string;
    content?: LessonContent | null;
    resources?: { id: string; title: string; url: string; type: string }[];
  };
  isCompleted?: boolean;
  onComplete?: () => void;
  onProgress?: (watchTime: number) => void;
  className?: string;
}

function VideoPlayer({ url }: { url: string }) {
  // Detect YouTube/Vimeo embeds vs direct video
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  const isVimeo = url.includes('vimeo.com');

  if (isYouTube || isVimeo) {
    let embedUrl = url;
    if (isYouTube) {
      const videoId = url.includes('youtu.be')
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : new URL(url).searchParams.get('v');
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (isVimeo) {
      const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
      if (vimeoId) embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
    }

    return (
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
        <iframe
          src={embedUrl}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video player"
        />
      </div>
    );
  }

  // Direct video URL
  return (
    <video
      src={url}
      controls
      style={{ width: '100%', borderRadius: 8, background: '#000' }}
    >
      Your browser does not support the video element.
    </video>
  );
}

function AudioPlayer({ url }: { url: string }) {
  return (
    <audio src={url} controls style={{ width: '100%' }}>
      Your browser does not support the audio element.
    </audio>
  );
}

function TextContent({ html }: { html: string }) {
  return (
    <div
      style={{ lineHeight: 1.7, fontSize: '1rem', color: '#1f2937' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function PdfViewer({ url }: { url: string }) {
  return (
    <iframe
      src={url}
      style={{ width: '100%', height: 600, border: '1px solid #e5e7eb', borderRadius: 8 }}
      title="PDF viewer"
    />
  );
}

function EmbedViewer({ url }: { url: string }) {
  return (
    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
      <iframe
        src={url}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
        title="Embedded content"
        allowFullScreen
      />
    </div>
  );
}

export function LessonPlayer({ lesson, isCompleted, onComplete, className }: LessonPlayerProps) {
  const content = lesson.content;

  return (
    <div className={className}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1rem', color: '#111827' }}>
        {lesson.title}
      </h2>

      {content && (
        <div style={{ marginBottom: '1.5rem' }}>
          {content.contentType === 'video' && content.contentUrl && (
            <VideoPlayer url={content.contentUrl} />
          )}
          {content.contentType === 'audio' && content.contentUrl && (
            <AudioPlayer url={content.contentUrl} />
          )}
          {content.contentType === 'text' && content.contentText && (
            <TextContent html={content.contentText} />
          )}
          {content.contentType === 'pdf' && content.contentUrl && (
            <PdfViewer url={content.contentUrl} />
          )}
          {content.contentType === 'embed' && content.contentUrl && (
            <EmbedViewer url={content.contentUrl} />
          )}
        </div>
      )}

      {!content && (
        <p style={{ color: '#6b7280', padding: '2rem', textAlign: 'center' }}>
          No content available for this lesson.
        </p>
      )}

      {lesson.resources && lesson.resources.length > 0 && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: 8 }}>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Resources</h4>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {lesson.resources.map((r) => (
              <li key={r.id} style={{ padding: '0.25rem 0' }}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#2D60FF', fontSize: '0.85rem', textDecoration: 'none' }}
                >
                  {r.title} ({r.type})
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {onComplete && !isCompleted && (
        <button
          onClick={onComplete}
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 2rem',
            background: '#2D60FF',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Mark as Complete
        </button>
      )}
      {isCompleted && (
        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: 600 }}>
          <span>\u2713</span> Completed
        </div>
      )}
    </div>
  );
}
