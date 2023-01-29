export type Chapter = [string, string | undefined, number | undefined];

export type ContentInfo = [[Chapter[], number, number], string, string];

export type VolumeOverview = [
  string, // book id
  [
    string, // book title
    string[], // authors
    string, // publisher
    string, // date (YYYY-MM-DD)
    string, // description
    null, // unknown
    null, // unknown
    [
      string, // cover url
      number, // unknown
      string, // primary color
      number, // unknown
      number, // unknown
    ][],
    string, // language code
    string, // details link
    null, // unknown
    null, // unknown
    number, // unknown
    number, // unknown
    null, // unknown
    null, // unknown
    [
      unknown[], // unknown (some ids?)
      string, // duration
      string, // unknown
      string[], // narrators
      // ...
    ],
    // ...
  ],
]

