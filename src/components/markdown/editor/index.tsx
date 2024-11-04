"use client";

import '@mdxeditor/editor/style.css'
import "@/components/markdown/editor/editor.css";
import { AdmonitionDirectiveDescriptor, BlockTypeSelect, BoldItalicUnderlineToggles, CreateLink, DiffSourceToggleWrapper, InsertAdmonition, InsertImage, InsertTable, InsertThematicBreak, ListsToggle, MDXEditor, type MDXEditorMethods, StrikeThroughSupSubToggles, UndoRedo, codeBlockPlugin, diffSourcePlugin, directivesPlugin, frontmatterPlugin, headingsPlugin, imagePlugin, linkDialogPlugin, linkPlugin, listsPlugin, markdownShortcutPlugin, quotePlugin, tablePlugin, thematicBreakPlugin, toolbarPlugin } from '@mdxeditor/editor'
import { type FC } from "react";


interface EditorProps {
  markdown: string;
  editorRef?: React.RefObject<MDXEditorMethods | null>;
  className?: string;
  initialMarkdown?: string;
  onChange?: (markdown: string) => void;
}

/**
 * Extend this Component further with the necessary plugins or props you need.
 * proxying the ref is necessary. Next.js dynamically imported components don't support refs.
 */
const MarkdownEditor: FC<EditorProps> = ({ markdown, editorRef, className, initialMarkdown, onChange }) => {
  return (
    <MDXEditor
      onChange={(e) => onChange && onChange(e)}
      ref={editorRef}
      markdown={markdown}
      className={className}
      contentEditableClassName="prose dark:prose-invert dark-editor"
      plugins={[
        listsPlugin(),
        quotePlugin(),
        headingsPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin(),
        tablePlugin(),
        thematicBreakPlugin(),
        frontmatterPlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
        directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
        diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: initialMarkdown }),
        markdownShortcutPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <StrikeThroughSupSubToggles />
              <ListsToggle />
              <BlockTypeSelect />
              <CreateLink />
              <InsertImage />
              <InsertTable />
              <InsertThematicBreak />
              <InsertAdmonition />
              <DiffSourceToggleWrapper>
                {null}
              </DiffSourceToggleWrapper>
            </>
          )
        })
      ]}
    />
  );
};

export default MarkdownEditor;  