import Footer from "@/components/footer";
import Header from "@/components/header";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "What is PULA?",
    answer:
      "PULA is a web-based tool for exploring words and phrases across multiple languages. It enables users to search for lexemes in a source language, view translations in one or more target languages, and contribute descriptions, translations, or audio pronunciations.",
  },
  {
    question: "What is PULA used for?",
    answer:
      "PULA is used to discover, document, and contribute multilingual lexical data. It supports language exploration and community-driven contributions to improve the availability of translations and pronunciations.",
  },
  {
    question: "How do I search for a word?",
    answer:
      "To search, select a source language and at least one target language, then enter a word or phrase in the search field. The search functionality becomes available once the required language selections have been made.",
  },
  {
    question: "Is it required to select two target languages?",
    answer:
      "No. Selecting a second target language is optional. Searches can be performed with a source language and a single target language. A second target language may be added later to display additional translations.",
  },
  {
    question: "Can languages be changed after a search has been performed?",
    answer:
      "Yes. On the results page, users may change the source language, update the primary target language, or add a second target language. When a second target language is added, the corresponding translations are retrieved automatically.",
  },
  {
    question: "Why is the search option disabled?",
    answer:
      "The search option is disabled until a source language and at least one target language have been selected. This ensures that searches are performed with the required contextual information.",
  },
  {
    question: "How can I contribute translations or audio?",
    answer:
      "Authenticated users may contribute translations, descriptions, or audio pronunciations directly from the results page using the available contribution actions.",
  },
  {
    question: "Is an account required to contribute?",
    answer:
      "Yes. An authenticated account is required to submit translations, descriptions, or audio recordings. Users who are not logged in will be prompted to authenticate before contributing.",
  },
  {
    question: "Why are no results displayed after searching?",
    answer:
      "Ensure that a source language and at least one target language have been selected prior to searching. Searches performed without the required language selections will not return results.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className=" text-center text-3xl font-normal mb-4 text-[#222222]">
            Frequently Asked Questions
          </h1>

          <Accordion.Root type="multiple" className="space-y-4">
            {FAQS.map((faq, index) => (
              <Accordion.Item
                key={index}
                value={`item-${index}`}
                className="border border-gray-300 rounded-lg bg-white"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="text-[#222222] group flex w-full items-center justify-between p-4 text-left font-medium">
                    {faq.question}
                    <ChevronDown className="h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180 " />
                  </Accordion.Trigger>
                </Accordion.Header>

                <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                  <div className=" px-4 pb-4 text-gray-700 max-h-64 overflow-y-auto ">
                    {faq.answer}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </main>
      <Footer />
    </div>
  );
}
