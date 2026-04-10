import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { useAppTheme } from '@/lib/theme';

type StudyMdxEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function StudyMdxEditor({ value, onChange }: StudyMdxEditorProps) {
  const { palette } = useAppTheme();

  return (
    <div
      style={{
        marginTop: 8,
        border: `1px solid ${palette.border}`,
        borderRadius: 12,
        background: palette.surfaceAlt,
        color: palette.textPrimary,
        padding: 8,
      }}
    >
      <MDEditor
        value={value}
        onChange={(next) => onChange(next ?? '')}
        preview="edit"
        textareaProps={{ placeholder: 'Write markdown + math syntax...' }}
        style={{
          background: palette.surfaceAlt,
          color: palette.textPrimary,
        }}
      />
    </div>
  );
}
