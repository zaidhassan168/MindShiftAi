import { NextRequest, NextResponse } from "next/server";
import { assistantId } from "@/app/assistant-config";
import { openai } from "@/app/openai";

// upload file to assistant's vector store
export async function POST(request: NextRequest) {
  const formData = await request.formData(); // process file as FormData
  const file = formData.get("file") as File; // retrieve the single file from FormData
  if (!file) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  try {
      const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store

      // upload using the file stream
      const openaiFile = await openai.files.create({
        file: file,
        purpose: "assistants",
      });

      // add file to vector store
      await openai.beta.vectorStores.files.create(vectorStoreId, {
        file_id: openaiFile.id,
      });

      return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error uploading file to vector store:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
// list files in assistant's vector store
export async function GET() {
  const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store
  const fileList = await openai.beta.vectorStores.files.list(vectorStoreId);

  const filesArray = await Promise.all(
    fileList.data.map(async (file) => {
      const fileDetails = await openai.files.retrieve(file.id);
      const vectorFileDetails = await openai.beta.vectorStores.files.retrieve(
        vectorStoreId,
        file.id
      );
      return {
        file_id: file.id,
        filename: fileDetails.filename,
        status: vectorFileDetails.status,
      };
    })
  );

  return NextResponse.json(filesArray);
}

// delete file from assistant's vector store
export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const fileId = body.fileId;

  const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store
  await openai.beta.vectorStores.files.del(vectorStoreId, fileId); // delete file from vector store

  return NextResponse.json({ success: true });
}

/* Helper functions */

const getOrCreateVectorStore = async () => {
  const assistant = await openai.beta.assistants.retrieve(assistantId);

  // if the assistant already has a vector store, return it
  if (assistant.tool_resources?.file_search?.vector_store_ids && assistant.tool_resources.file_search.vector_store_ids.length > 0) {
    return assistant.tool_resources.file_search.vector_store_ids[0];
  }

  // otherwise, create a new vector store and attach it to the assistant
  const vectorStore = await openai.beta.vectorStores.create({
    name: "sample-assistant-vector-store",
  });
  await openai.beta.assistants.update(assistantId, {
    tool_resources: {
      file_search: {
        vector_store_ids: [vectorStore.id],
      },
    },
  });
  return vectorStore.id;
};
