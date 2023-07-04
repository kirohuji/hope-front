import PropTypes from 'prop-types';
// @mui
import { Grid, Card, Button, Typography, Stack } from '@mui/material';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
//


// ----------------------------------------------------------------------

QuestionnareCards.propTypes = {
  questions: PropTypes.array,
  onAdd: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};

export default function QuestionnareCards ({ onAdd, onEdit, onDelete,questions}) {
  return (
    <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          {questions.map((question, index) => (
            <QuestionItem
              key={index}
              question={{
                ...question,
                title: index,
              }}
              onEdit={() => onEdit(question)}
              onDelete={() => onDelete(question)}
            />
          ))}

          <Stack direction="row" justifyContent="space-between">
            <Button
              onClick={onAdd}
              size="small"
              variant="soft"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              添加问题
            </Button>
          </Stack>
        </Grid>
      </Grid>
  );
}

// ----------------------------------------------------------------------

QuestionItem.propTypes = {
  question: PropTypes.object,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};

function QuestionItem ({ question, onEdit, onDelete }) {
  const { title, content, necessary } = question;

  return (
    <Card
      sx={{
        p: 3,
        mb: 3,
      }}
    >
      <Stack
        spacing={2}
        alignItems={{
          md: 'flex-end',
        }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
      >
        <Stack flexGrow={1} spacing={1}>
          <Stack direction="row" alignItems="center">
            <Typography variant="subtitle1">
              问题{title + 1}
            </Typography>
            {necessary && (
              <Label color="error" sx={{ ml: 1 }}>
                必答
              </Label>
            )}
          </Stack>
          <Typography variant="body2" dangerouslySetInnerHTML={{ __html: content }} />
        </Stack>

        <Stack flexDirection="row" flexWrap="wrap" flexShrink={0}>
          <Button variant="outlined" size="small" color="inherit" sx={{ mr: 1 }} onClick={onDelete}>
            删除
          </Button>
          <Button variant="outlined" size="small" onClick={onEdit}>
            编辑
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
