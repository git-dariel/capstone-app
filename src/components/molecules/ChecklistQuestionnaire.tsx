import React, { useState } from "react";
import { ArrowLeft, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui";
import { FullScreenLoading } from "@/components/atoms";
import { cn } from "@/lib/utils";

interface ChecklistQuestionnaireProps {
  onBack: () => void;
  onSubmit: (responses: Record<string, string>) => void;
  loading?: boolean;
}

interface CategorySection {
  title: string;
  description: string;
  questions: Array<{
    id: string;
    text: string;
  }>;
}

const categoryData: CategorySection[] = [
  {
    title: "Social/Friends Problems",
    description: "Problems related to relationships and social interactions",
    questions: [
      { id: "1", text: "Not getting along with other people" },
      { id: "2", text: "Being criticized by others" },
      { id: "3", text: "Not fitting in with peers" },
      { id: "4", text: "Feeling uncomfortable in social settings" },
      { id: "5", text: "Having a bad reputation" },
      { id: "6", text: "Feeling immature" },
      { id: "7", text: "Being suspicious of others" },
      { id: "8", text: "Being shy" },
      { id: "9", text: "Not having close friends" },
      { id: "10", text: "Being taken advantage of by friends" },
      { id: "11", text: "Not having anyone to share interests with" },
      { id: "12", text: "Feeling lonely" },
      { id: "13", text: "Feeling unpopular" },
      { id: "14", text: "Feeling uncomfortable when talking to people" },
      { id: "15", text: "Feeling inferior" },
      { id: "16", text: "Feeling like people are against me" },
      { id: "17", text: "Being embarrassed by family background" },
      { id: "18", text: "Being let down by friends" },
      { id: "19", text: "Feeling different from everyone else" },
      { id: "20", text: "Being pressured to do the wrong thing" },
    ],
  },
  {
    title: "Appearance Problems",
    description: "Concerns about physical appearance and body image",
    questions: [
      { id: "21", text: "Being overweight" },
      { id: "22", text: "Being too short or too tall" },
      { id: "23", text: "Having a physical handicap" },
      { id: "24", text: "Being too thin" },
      { id: "25", text: "Looking too young or too old" },
      { id: "26", text: "Being noticed for physical appearance" },
      { id: "27", text: "Looking too plain" },
      { id: "28", text: "Feeling clumsy and awkward" },
      { id: "29", text: "Not being clean and well groomed" },
      { id: "30", text: "Not having the right clothes" },
      { id: "31", text: "Having an unattractive face" },
      { id: "32", text: "Having scars" },
      { id: "33", text: "Having facial blemishes" },
      { id: "34", text: "Not being well developed" },
    ],
  },
  {
    title: "Attitude/Opinion Problems",
    description: "Issues with personal attitudes and opinions",
    questions: [
      { id: "35", text: "Having a poor attitude about everything" },
      { id: "36", text: "Not having any goals in life" },
      { id: "37", text: "Having a recent change in attitude" },
      { id: "38", text: "Not listening to the opinions of others" },
      { id: "39", text: "Having no opinions about things" },
      { id: "40", text: "Having different values from others" },
      { id: "41", text: "Not understanding the attitudes of others" },
      { id: "42", text: "Having a poor attitude toward religion" },
      { id: "43", text: "Having a poor attitude toward school" },
      { id: "44", text: "Having a poor attitude toward work" },
      { id: "45", text: "Having a poor attitude toward family" },
      { id: "46", text: "Having a poor attitude toward self" },
    ],
  },
  {
    title: "Parents Problems",
    description: "Difficulties with parents and family authority",
    questions: [
      { id: "47", text: "Father or mother being sick" },
      { id: "48", text: "Father or mother having emotional problems" },
      { id: "49", text: "Father or mother being unemployed" },
      { id: "50", text: "Father or mother having problem with alcohol" },
      { id: "51", text: "Parents fighting or arguing" },
      { id: "52", text: "Parents being separated or getting divorced" },
      { id: "53", text: "Parents being divorced, remarried or stepmother" },
      { id: "54", text: "Having problems with stepfather or stepmother" },
      { id: "55", text: "Parents never being home" },
      { id: "56", text: "Not being able to talk to parents" },
      { id: "57", text: "Parents being too strict" },
      { id: "58", text: "Parents interfering with decisions" },
      { id: "59", text: "Parents expecting too much" },
      { id: "60", text: "Parents disapproving of boyfriend/girlfriend" },
      { id: "61", text: "Parents not trusting me" },
      { id: "62", text: "Parents disapproving of job" },
      { id: "63", text: "Parents disapproving of clothes or appearance" },
      { id: "64", text: "Parents disapproving of dating" },
      { id: "65", text: "Parents disapproving of music" },
      { id: "66", text: "Parents disapproving of activities" },
      { id: "67", text: "Parents favoring brothers or sisters" },
      { id: "68", text: "Being ignored by parents" },
    ],
  },
  {
    title: "Family/Home Problems",
    description: "Issues within the family and home environment",
    questions: [
      { id: "69", text: "Brother or sister being sick" },
      { id: "70", text: "Brother or sister having emotional problems" },
      { id: "71", text: "Brother or sister being unemployed/drugs" },
      { id: "72", text: "Brother or sister being in trouble with law" },
      { id: "73", text: "Being physically abused at home" },
      { id: "74", text: "Being sexually abused at home" },
      { id: "75", text: "Arguing with brother or sister" },
      { id: "76", text: "Family always arguing" },
      { id: "77", text: "Being bothered by brother or sister" },
      { id: "78", text: "Family fighting or arguing" },
      { id: "79", text: "Having problems with relatives" },
      { id: "80", text: "Not being any privacy" },
      { id: "81", text: "Having to do household chores" },
      { id: "82", text: "Not feeling close to family" },
      { id: "83", text: "Family not having enough money" },
      { id: "84", text: "Not getting along with neighbors" },
      { id: "85", text: "Not willing to live at home" },
      { id: "86", text: "Home being dirty or messy" },
      { id: "87", text: "Family having a bad reputation" },
      { id: "88", text: "Living in a bad neighborhood" },
      { id: "89", text: "Being adopted" },
      { id: "90", text: "Not being allowed to use the car" },
      { id: "91", text: "Not being allowed to buy a car" },
      { id: "92", text: "Wanting to run away from home" },
    ],
  },
  {
    title: "School Problems",
    description: "Academic and school-related difficulties",
    questions: [
      { id: "93", text: "Getting bad grades" },
      { id: "94", text: "Not getting along with teachers" },
      { id: "95", text: "Deciding on the right course or studies" },
      { id: "96", text: "Not having good study habits" },
      { id: "97", text: "Not having a good place to study" },
      { id: "98", text: "Taking the wrong courses" },
      { id: "99", text: "Not being interested in school or teams" },
      { id: "100", text: "Not qualifying for clubs or teams" },
      { id: "101", text: "Not having close friends at school" },
      { id: "102", text: "School being too large" },
      { id: "103", text: "Missing school because of illness" },
      { id: "104", text: "Not understanding class material" },
      { id: "105", text: "Not getting along with other students" },
      { id: "106", text: "Feeling out of place in school" },
      { id: "107", text: "Not being interested in school" },
      { id: "108", text: "Having a language problem in school" },
      { id: "109", text: "Being in the wrong school" },
      { id: "110", text: "Teachers not being interested in students" },
      { id: "111", text: "Being bored in school" },
      { id: "112", text: "Getting in trouble in school" },
      { id: "113", text: "School being too far from home" },
      { id: "114", text: "Worrying about future job or college" },
    ],
  },
  {
    title: "Money Problems",
    description: "Financial concerns and money-related issues",
    questions: [
      { id: "115", text: "Budgeting money" },
      { id: "116", text: "Not making enough money" },
      { id: "117", text: "Not having a steady income" },
      { id: "118", text: "Having to spend savings" },
      { id: "119", text: "Owing money" },
      { id: "120", text: "Wasting money" },
      { id: "121", text: "Depending on others for money" },
      { id: "122", text: "Lending money to friends or family" },
      { id: "123", text: "Having to give money to parents" },
      { id: "124", text: "Not having enough money to date" },
      { id: "125", text: "Not having gas money" },
      { id: "126", text: "Not having money for clothes" },
    ],
  },
  {
    title: "Religion Problems",
    description: "Spiritual and religious concerns",
    questions: [
      { id: "127", text: "Feeling guilty about religion" },
      { id: "128", text: "Not liking any religious beliefs" },
      { id: "129", text: "Arguing with parents about religious beliefs" },
      { id: "130", text: "Being confused about religious beliefs" },
      { id: "131", text: "Falling in religious beliefs" },
      { id: "132", text: "Boyfriend/girlfriend having a different religion" },
      { id: "133", text: "Arguing with girlfriend/boyfriend about religion" },
      { id: "134", text: "Not being able to get to church" },
      { id: "135", text: "Chores interfering with church activities" },
      { id: "136", text: "Job interfering with church activities" },
      { id: "137", text: "Being upset by religious beliefs of others" },
      { id: "138", text: "Worrying about being accepted by God" },
      { id: "139", text: "Being rejected by church members" },
      { id: "140", text: "Not having friends at church" },
    ],
  },
  {
    title: "Emotional Problems",
    description: "Feelings and emotional difficulties",
    questions: [
      { id: "141", text: "Feeling anxious or uptight" },
      { id: "142", text: "Being afraid of things" },
      { id: "143", text: "Having the same thoughts over and over again" },
      { id: "144", text: "Being tired and having no energy" },
      { id: "145", text: "Feeling depressed or sad" },
      { id: "146", text: "Having trouble concentrating" },
      { id: "147", text: "Not remembering things" },
      { id: "148", text: "Getting too emotional" },
      { id: "149", text: "Losing control" },
      { id: "150", text: "Worrying about diseases or illness" },
      { id: "151", text: "Having nightmares" },
      { id: "152", text: "Thinking too much about death" },
      { id: "153", text: "Being afraid of hurting self" },
      { id: "154", text: "Feeling things are unreal" },
      { id: "155", text: "Crying without good reason" },
      { id: "156", text: "Worrying about having a nervous breakdown" },
      { id: "157", text: "Not being able to stop worrying" },
      { id: "158", text: "Not being able to relax" },
      { id: "159", text: "Being unhappy all the time" },
      { id: "160", text: "Not having any enjoyment in life" },
      { id: "161", text: "Being influenced by others" },
      { id: "162", text: "Behaving in strange ways" },
      { id: "163", text: "Feeling out of control" },
      { id: "164", text: "Being afraid of hurting someone else" },
    ],
  },
  {
    title: "Dating/Sex Problems",
    description: "Relationship and sexuality concerns",
    questions: [
      { id: "165", text: "Being uncomfortable with opposite sex" },
      { id: "166", text: "Not being able to get a boyfriend/girlfriend" },
      { id: "167", text: "Having problems with boyfriend/girlfriend" },
      { id: "168", text: "Wanting to break up with boyfriend/girlfriend" },
      { id: "169", text: "Losing boyfriend/girlfriend" },
      { id: "170", text: "Arguing with boyfriend/girlfriend and dating and sex" },
      { id: "171", text: "Not having enough dates" },
      { id: "172", text: "Worrying about getting pregnant" },
      { id: "173", text: "Not being able to talk about dating and sex" },
      { id: "174", text: "Being pregnant or girlfriend being pregnant" },
      { id: "175", text: "Not knowing enough about sex" },
      { id: "176", text: "Worrying about sex" },
      { id: "177", text: "Thinking about sex too often" },
      { id: "178", text: "Worrying about being gay" },
      { id: "179", text: "Being troubled by sexual attitudes of friends" },
      { id: "180", text: "Being troubled by unusual sexual behavior" },
      { id: "181", text: "Being sexually underdeveloped" },
      { id: "182", text: "Boyfriend/girlfriend wanting to get married" },
      { id: "183", text: "Feeling used or being pushed into having sex" },
    ],
  },
];

const answerChoices = [
  { value: "0", label: "Not Checked", description: "This is not a problem for me" },
  { value: "1", label: "Checked", description: "This is a problem for me" },
  { value: "2", label: "Most Important", description: "This is one of my most important problems" },
];

export const ChecklistQuestionnaire: React.FC<ChecklistQuestionnaireProps> = ({
  onBack,
  onSubmit,
  loading = false,
}) => {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [expandedCategory, setExpandedCategory] = useState<number>(0);

  const handleAnswerSelect = (questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = () => {
    onSubmit(responses);
  };

  const toggleCategory = (categoryIndex: number) => {
    setExpandedCategory(expandedCategory === categoryIndex ? -1 : categoryIndex);
  };

  const getTotalAnswered = () => {
    return Object.keys(responses).length;
  };

  const getTotalQuestions = () => {
    return categoryData.reduce((total, category) => total + category.questions.length, 0);
  };

  const getAnsweredInCategory = (categoryIndex: number) => {
    const category = categoryData[categoryIndex];
    return category.questions.filter((q) => responses[q.id]).length;
  };

  const isCompleted = () => {
    return getTotalAnswered() >= Math.floor(getTotalQuestions() * 0.5); // At least 50% answered
  };

  if (loading) {
    return <FullScreenLoading isLoading={true} message="Submitting your personal problems checklist..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4 text-gray-700 hover:text-gray-800 hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessments
          </Button>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Personal Problems Checklist for Adolescents</h1>
            <p className="text-gray-600 mb-4">
              This checklist helps identify areas where you may be experiencing difficulties. For each item, choose
              whether it applies to you and mark your most important concerns.
            </p>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  Progress: {getTotalAnswered()} of {getTotalQuestions()} items
                </span>
                <span>{Math.round((getTotalAnswered() / getTotalQuestions()) * 100)}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(getTotalAnswered() / getTotalQuestions()) * 100}%` }}
                />
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>
                <strong>Instructions:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>Not Checked:</strong> This is not a problem for you
                </li>
                <li>
                  <strong>Checked:</strong> This is a problem for you
                </li>
                <li>
                  <strong>Most Important:</strong> This is one of your most important problems
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4 mb-8">
          {categoryData.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryIndex)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{category.title}</h3>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                    <div className="mt-2 text-sm text-blue-600">
                      {getAnsweredInCategory(categoryIndex)} of {category.questions.length} answered
                    </div>
                  </div>
                  <div className="flex items-center">
                    {expandedCategory === categoryIndex ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Category Questions */}
              {expandedCategory === categoryIndex && (
                <div className="border-t border-gray-100 p-6 bg-gray-25">
                  <div className="space-y-6">
                    {category.questions.map((question) => (
                      <div key={question.id} className="bg-white rounded-lg p-4 shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-3">{question.text}</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {answerChoices.map((choice) => (
                            <button
                              key={choice.value}
                              onClick={() => handleAnswerSelect(question.id, choice.value)}
                              className={cn(
                                "p-3 rounded-lg border-2 text-sm transition-all duration-200 text-left",
                                responses[question.id] === choice.value
                                  ? choice.value === "0"
                                    ? "border-gray-400 bg-gray-100 text-gray-800"
                                    : choice.value === "1"
                                    ? "border-blue-400 bg-blue-100 text-blue-800"
                                    : "border-red-400 bg-red-100 text-red-800"
                                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                              )}
                            >
                              <div className="font-medium">{choice.label}</div>
                              <div className="text-xs opacity-80 mt-1">{choice.description}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              {isCompleted() ? (
                <span className="text-blue-600 font-medium">✓ Ready to submit your responses</span>
              ) : (
                <span>Please answer at least 50% of the questions to continue</span>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!isCompleted()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Checklist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
